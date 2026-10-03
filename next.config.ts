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
      {
        protocol: "https",
        hostname: "static.wikia.nocookie.net",
      },
      {
        protocol: "https",
        hostname: "shadowverse-wb.com",
      },
      {
        protocol: "https",
        hostname: "collaboration.shadowverse-wb.com",
      },
    ],
  },
};

export default nextConfig;
