import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Aumenta el limite para subir banners (8MB) e imagenes de tarjeta (4MB).
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
