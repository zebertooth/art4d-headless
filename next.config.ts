import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "art4d.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
