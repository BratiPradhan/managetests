import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxy browser requests through our own origin so they're same-origin
        // (avoids CORS — the backend doesn't allow our deployed origin).
        // The actual cross-origin call happens server-side, which isn't subject to CORS.
        source: "/api/:path*",
        destination: `${process.env.BACKEND_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
