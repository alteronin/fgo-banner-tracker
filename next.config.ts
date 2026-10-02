import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.mana.wiki",
      },
      {
        protocol: "https",
        hostname: "img.game8.co",
      },
    ],
  },
};

export default nextConfig;
