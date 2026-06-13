import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // On Vercel (CI=1), output .next to repo root so Vercel's adapter finds it at the default location
  distDir: process.env.VERCEL ? "../.next" : ".next",
  headers: () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Content-Type", value: "application/javascript; charset=utf-8" },
      ],
    },
    {
      source: "/manifest.json",
      headers: [{ key: "Content-Type", value: "application/manifest+json" }],
    },
  ],
};

export default nextConfig;
