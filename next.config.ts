import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.2xlbet.com" },
      { protocol: "http", hostname: "localhost", port: "4000" },
    ],
    // Next 16 blocks image optimization for any URL resolving to a private
    // IP (SSRF hardening) — localhost triggers this in local dev, but
    // production's real hostname above never does. Dev-only, never enabled
    // in the deployed build.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
