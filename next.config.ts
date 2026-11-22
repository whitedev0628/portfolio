import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/": ["./data/content.json"],
    "/admin": ["./data/content.json"],
    "/api/admin/content": ["./data/content.json"],
  },
};

export default nextConfig;
