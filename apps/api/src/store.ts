import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { dataDir, db, schema } from "./db/client.js";

/** Public form storage (newsletter, contact, membership). Data lives in the database (see db/client.ts). */

/** Returns false when the email is already subscribed (re-subscribing clears a past unsubscribe). */
export async function addSubscriber(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const inserted = await db
    .insert(schema.subscribers)
    .values({ email: normalized })
    .onConflictDoNothing({ target: schema.subscribers.email })
    .returning({ id: schema.subscribers.id });
  if (inserted.length) return true;
  await db.update(schema.subscribers).set({ unsubscribedAt: null }).where(eq(schema.subscribers.email, normalized));
  return false;
}

export type ContactMessageInput = { name: string; email: string; topic: string; message: string; locale: string };

/** Stores a message from the contact form. */
export async function addContactMessage(msg: ContactMessageInput): Promise<void> {
  await db.insert(schema.contactMessages).values({ ...msg, email: msg.email.trim().toLowerCase() });
}

export type NetworkApplicationInput = Omit<typeof schema.applications.$inferInsert, "status" | "reviewedBy" | "reviewedAt" | "createdAt"> & {
  id: string;
};

/** Stores a membership application ("Add your voice to ours"). */
export async function addNetworkApplication(app: NetworkApplicationInput): Promise<void> {
  await db.insert(schema.applications).values({ ...app, email: app.email.trim().toLowerCase() });
}

/**
 * Saves an uploaded photo under data/uploads and returns its file name.
 * Local disk for now; production needs object storage (see SPEC.md, open items).
 */
export async function saveUpload(name: string, data: Buffer): Promise<string> {
  await mkdir(join(dataDir, "uploads"), { recursive: true });
  await writeFile(join(dataDir, "uploads", name), data);
  return name;
}
