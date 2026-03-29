import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  allowedDevOrigins: ["10.71.19.241"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*", // Proxy to FastAPI backend
      },
    ];
  },
};

export default nextConfig;
