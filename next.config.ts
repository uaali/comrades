import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "lh3.googleusercontent.com" },{ hostname: "firebasestorage.googleapis.com" }],
  },
};

export default nextConfig;
