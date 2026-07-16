import { toAssetUrl } from "@/utils/blob-path";

type CardImageInput = {
  imageUrl?: string | null;
  code?: string | null;
  idd?: string | null;
  imageKey?: string | null;
};

export const normalizeCardImageKey = (value?: string | null) => {
  const normalized = value?.trim().replace(/^\/+/, "") ?? "";
  if (!normalized) return "";
  if (normalized.startsWith("cards/")) return normalized;
  if (normalized.toLowerCase().endsWith(".webp")) return `cards/${normalized}`;
  return `cards/${normalized}.webp`;
};

export const buildCardImageKey = (code?: string | null, idd?: string | null) =>
  code && idd ? `cards/${code}-${idd}.webp` : "";

export const resolveCardImageUrl = ({
  imageUrl,
  code,
  idd,
  imageKey,
}: CardImageInput) => {
  if (imageUrl) return toAssetUrl(imageUrl);

  const key = imageKey
    ? normalizeCardImageKey(imageKey)
    : buildCardImageKey(code, idd);
  return key ? toAssetUrl(key) : "";
};
