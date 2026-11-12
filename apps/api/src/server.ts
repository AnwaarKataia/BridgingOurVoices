import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { runMigrations } from "./db/client.js";
import { addContactMessage, addSubscriber } from "./store.js";
import { multipartLimits, networkRoutes } from "./network.js";
import { authRoutes } from "./auth/routes.js";
import { contentRoutes } from "./content/routes.js";
import { mediaRoutes } from "./content/media.js";
import { syncSeed } from "./content/seed.js";

/** Contact form subjects (the portal's select options use these values). */
const contactTopics = ["general", "training", "fellowship", "partnerships", "media"];

const port = Number(process.env.PORT ?? 4000);
const origins = (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:3001").split(",");

// Apply pending database migrations before accepting requests
await runMigrations();

// TRUST_PROXY=true when the API sits behind a proxy (the dashboard's /api rewrite, a host's load balancer),
// so rate limits see the visitor's IP instead of the proxy's.
const app = Fastify({ logger: true, trustProxy: process.env.TRUST_PROXY === "true" });
app.decorateRequest("user", null);
// Public forms are called from the portal's browser pages (CORS). The dashboard reaches the API through its
// own /api rewrite, so session cookies never need cross-origin credentials.
await app.register(cors, { origin: origins });
await app.register(cookie);
await app.register(rateLimit, { global: false });
await app.register(multipart, { limits: multipartLimits, throwFileSizeLimit: true });
await app.register(networkRoutes);
await app.register(authRoutes);
// Page content (seeded from apps/api/seed/content.json on first run) + images
await syncSeed((m) => app.log.info(m));
await app.register(contentRoutes);
await app.register(mediaRoutes);

app.get("/health", async () => ({ ok: true }));

app.post<{ Body: { email: string } }>(
  "/newsletter",
  {
    schema: {
      body: {
        type: "object",
        required: ["email"],
        properties: { email: { type: "string", format: "email", maxLength: 254 } },
        additionalProperties: false,
      },
    },
  },
  async (req, reply) => {
    const added = await addSubscriber(req.body.email);
    return reply.code(added ? 201 : 200).send({ ok: true });
  },
);

type ContactBody = { name: string; email: string; topic: string; message: string; locale?: string; website?: string };

app.post<{ Body: ContactBody }>(
  "/contact",
  {
    schema: {
      body: {
        type: "object",
        required: ["name", "email", "topic", "message"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 120 },
          email: { type: "string", format: "email", maxLength: 254 },
          topic: { type: "string", enum: contactTopics },
          message: { type: "string", minLength: 10, maxLength: 5000 },
          locale: { type: "string", enum: ["en", "fr", "ar"] },
          // Honeypot: hidden in the form, so only bots fill it
          website: { type: "string", maxLength: 200 },
        },
        additionalProperties: false,
      },
    },
  },
  async (req, reply) => {
    const { website, locale = "en", ...msg } = req.body;
    // Pretend success to bots without storing anything
    if (website) return reply.code(201).send({ ok: true });
    await addContactMessage({ ...msg, name: msg.name.trim(), message: msg.message.trim(), locale });
    return reply.code(201).send({ ok: true });
  },
);

await app.listen({ port, host: "0.0.0.0" });
