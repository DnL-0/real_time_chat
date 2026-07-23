import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The whole app runs client-side against Firebase, so we export it as plain
  // static files. `next build` then emits an `out/` folder that Firebase
  // Hosting can serve directly — no server, no Cloud Functions, free tier.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
