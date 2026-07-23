import { toAssetStorageUrl } from "@/utils/asset-path";
import { newsImageFallbacks } from "@/models/media-fallbacks.models";

type NewsImageFolder = "banners" | "cards";

export const resolveNewsImageUrl = (
  value: string | null | undefined,
  folder: NewsImageFolder,
) => {
  const fallback = newsImageFallbacks[folder];

  if (!value) return fallback;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/")) {
    return value;
  }
  if (value.startsWith("souls/")) {
    return toAssetStorageUrl(value.slice("souls/".length));
  }
  if (value.includes("/")) {
    return toAssetStorageUrl(value);
  }
  // Compatibilidad con registros antiguos: evita romper la UI si llega un nombre local.
  return `/news/${folder}/${value}`;
};
