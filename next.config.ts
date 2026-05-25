import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';
const backendOrigin = apiUrl.replace(/\/api\/?$/, '');

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.60'],
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: `${backendOrigin}/admin`,
      },
      {
        source: '/admin/:path*',
        destination: `${backendOrigin}/admin/:path*`,
      },
    ];
  },
};

export default nextConfig;
