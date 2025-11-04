import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: (process.env.NEXT_PUBLIC_API_PROTOCOL || 'http') as 'http' | 'https',
        hostname: process.env.NEXT_PUBLIC_API_HOST || 'localhost',
        port: process.env.NEXT_PUBLIC_API_PORT || '5000',
        pathname: process.env.NEXT_PUBLIC_API_PATH,
      },
    ],
  },
};

export default nextConfig;
