import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Aumenta el limite para subir banners (8MB) e imagenes de tarjeta (4MB).
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  images: {
    // Limita variantes generadas para reducir transferencia de origen.
    deviceSizes: [360, 640, 768, 1024, 1280, 1536],
    imageSizes: [120, 160, 200, 240, 300, 360, 420],
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
