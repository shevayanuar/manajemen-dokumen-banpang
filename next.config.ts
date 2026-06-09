import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    staleTimes: {
      dynamic: 300,  // 5 menit untuk dynamic routes
      static: 300,
    },
  },
};

export default nextConfig;