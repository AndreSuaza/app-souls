import { toBlobUrl } from "@/utils/blob-path";

const DEFAULT_BANNER =
  "souls/profile/banners/bg-cardlist-a7c26a26-b921-4e7a-8867-26ed9ad7de54.webp";

const isHttpUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const normalizeBannerValue = (value?: string | null) => {
  if (!value) return DEFAULT_BANNER;
  if (isHttpUrl(value)) return value;
  if (value.startsWith("souls/")) return value;
  if (value.startsWith("/")) return value.slice(1);
  if (value.includes("/")) return value;
  return `souls/profile/banners/${value}.webp`;
};

export const getProfileBannerUrl = (value?: string | null) => {
  const normalized = normalizeBannerValue(value);
  if (isHttpUrl(normalized)) return normalized;
  if (normalized.startsWith("profile/")) return `/${normalized}`;
  return toBlobUrl(normalized);
};

export const getProfileBannerValue = (value?: string | null) =>
  normalizeBannerValue(value);

export const DEFAULT_PROFILE_BANNER = DEFAULT_BANNER;
