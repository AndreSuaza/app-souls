import { toAssetStorageUrl } from "@/utils/asset-path";

const DEFAULT_BANNER =
  "profile/banners/angel-82ca9604-cf1a-41a4-8240-7f9092720280.webp";

const isHttpUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const normalizeBannerValue = (value?: string | null) => {
  if (!value) return DEFAULT_BANNER;
  if (isHttpUrl(value)) return value;
  if (value.startsWith("souls/")) return value.slice("souls/".length);
  if (value.startsWith("/")) return value.slice(1);
  if (value.includes("/")) return value;
  return `profile/banners/${value}.webp`;
};

export const getProfileBannerUrl = (value?: string | null) => {
  const normalized = normalizeBannerValue(value);
  if (isHttpUrl(normalized)) return normalized;
  return toAssetStorageUrl(normalized);
};

export const getProfileBannerValue = (value?: string | null) =>
  normalizeBannerValue(value);

export const DEFAULT_PROFILE_BANNER = DEFAULT_BANNER;
