import { toBlobUrl } from "@/utils/blob-path";

type NewsImageFolder = "banners" | "cards";

export const resolveNewsImageUrl = (
  value: string,
  folder: NewsImageFolder,
) => {
  if (!value) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/")) {
    return value;
  }
  if (value.startsWith("souls/")) {
    return toBlobUrl(value);
  }
  // Compatibilidad con registros antiguos: evita romper la UI si llega un nombre local.
  return `/news/${folder}/${value}`;
};
