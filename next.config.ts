import type { NextConfig } from "next";

const backendOrigin = process.env.BACKEND_INTERNAL_URL || 'http://backend:8000';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.60'],
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/admin/',
        destination: `${backendOrigin}/admin/`,
      },
      {
        source: '/admin/:path*',
        destination: `${backendOrigin}/admin/:path*`,
      },
    ];
  },
};

export default nextConfig;
