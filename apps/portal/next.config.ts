import type { NextConfig } from "next";

/** Images uploaded in the dashboard live on the API; the portal serves them at the same /media/… path. */
const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/media/:file", destination: `${apiUrl}/media/:file` },
      // Photos of published "Add your voice" statements and members (the API serves them only while published)
      { source: "/public-photo/:id", destination: `${apiUrl}/public/photo/:id` },
    ];
  },
  async redirects() {
    return [
      // Keep in sync with defaultLocale in src/i18n/config.ts
      { source: "/", destination: "/en", permanent: false },
      // Section roots open their first page (each dropdown item is its own page)
      { source: "/:locale(en|fr|ar)/about", destination: "/:locale/about/who-we-are", permanent: false },
      { source: "/:locale(en|fr|ar)/activities", destination: "/:locale/activities/training", permanent: false },
      { source: "/:locale(en|fr|ar)/network", destination: "/:locale/network/membership", permanent: false },
    ];
  },
};

export default nextConfig;
