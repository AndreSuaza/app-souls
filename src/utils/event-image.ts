import { toBlobUrl } from "@/utils/blob-path";
import { eventImageFallbacks } from "@/models/media-fallbacks.models";

type EventImageFolder = "banners" | "cards";

export const resolveEventImageUrl = (
  value: string | null | undefined,
  folder: EventImageFolder,
) => {
  const fallback = eventImageFallbacks[folder];

  if (!value) return fallback;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/")) {
    return value;
  }
  if (value.startsWith("souls/")) {
    return toBlobUrl(value.slice("souls/".length));
  }
  if (value.includes("/")) {
    return toBlobUrl(value);
  }
  // Compatibilidad con nombres locales mientras se define media propia de eventos.
  return `/events/${folder}/${value}`;
};
