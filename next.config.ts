import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrite API calls to FastAPI during development, but exclude auth routes
  async rewrites() {
    return {
      beforeFiles: [
        // NextAuth routes should not be proxied
        {
          source: "/api/auth/:path*",
          destination: "/api/auth/:path*",
        },
      ],
      fallback: [
        // Proxy other API calls to FastAPI
        {
          source: "/api/:path*",
          destination:
            process.env.NODE_ENV === "development"
              ? "http://127.0.0.1:8000/api/:path*"
              : "/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
