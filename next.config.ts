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
  process.env.R2_PUBLIC_ASSET_REDIRECT_FOLDERS ?? "cards,products,profile"
)
  .split(",")
  .map((folder) => folder.trim())
  .filter((folder) => staticAssetFolders.includes(folder));

const nextConfig: NextConfig = {
  experimental: {
    // Aumenta el limite para imports masivos de cartas con ZIP de imagenes.
    serverActions: {
      bodySizeLimit: "80mb",
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
