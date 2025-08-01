import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // to accept images 
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  }
};

export default nextConfig;
