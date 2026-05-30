import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.60'],
  reactStrictMode: true,
  experimental: {
    inlineCss: true,
  },
};

export default nextConfig;
