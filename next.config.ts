import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "8nothtoc5ds7a0x3.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
