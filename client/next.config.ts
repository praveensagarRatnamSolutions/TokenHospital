import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Next.js 16 generates .next/types/*.ts files with .js references that
    // fail resolution during OpenNext builds — type checking runs in CI instead
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // avoids Windows path bug in OpenNext image-optimization Lambda
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
