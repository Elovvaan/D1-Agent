import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "64mb"
    }
  },
  async rewrites() {
    return [
      {
        source: "/discover",
        destination: "/search?mode=discover"
      }
    ];
  }
};

export default nextConfig;
