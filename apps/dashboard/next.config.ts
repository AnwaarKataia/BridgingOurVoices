import type { NextConfig } from "next";

/** Where the API runs. The browser never calls it directly: /api/* on the dashboard is proxied there,
 *  so the session cookie stays first-party (same origin as the dashboard). */
const apiUrl = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiUrl}/:path*` },
      // Uploaded images, for previews in the content editor
      { source: "/media/:file", destination: `${apiUrl}/media/:file` },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Private admin: never indexed, never framed
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
