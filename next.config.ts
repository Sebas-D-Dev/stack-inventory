import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    // Ensure local images work properly
    remotePatterns: [],
  },
  // Ensure static files are properly handled
  assetPrefix: '',
};

export default nextConfig;
