import type { NextConfig } from "next";

const assetsBaseUrl = (process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? "").replace(
  /\/+$/,
  "",
);
const staticAssetFolders = [
  "cards",
  "decks",
  "global",
  "home",
  "howtoplay",
  "national",
  "news",
  "products",
  "profile",
  "tournaments",
];
const enableR2PublicAssetRedirects =
  process.env.ENABLE_R2_PUBLIC_ASSET_REDIRECTS === "true";
const r2PublicAssetRedirectFolders = (
  process.env.R2_PUBLIC_ASSET_REDIRECT_FOLDERS ?? "cards"
)
  .split(",")
  .map((folder) => folder.trim())
  .filter((folder) => staticAssetFolders.includes(folder));

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
        hostname: "assets.soulsinxtinction.com",
      },
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
      },
    ],
  },
  async redirects() {
    if (!assetsBaseUrl || !enableR2PublicAssetRedirects) return [];

    return r2PublicAssetRedirectFolders.map((folder) => ({
      source: `/${folder}/:path*`,
      destination: `${assetsBaseUrl}/${folder}/:path*`,
      permanent: false,
    }));
  },
  async headers() {
    return [
      ...staticAssetFolders.map((folder) => ({
        source: `/${folder}/:path*`,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      })),
    ];
  },
};

export default nextConfig;
