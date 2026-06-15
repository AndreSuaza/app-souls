import { toBlobUrl } from "@/utils/blob-path";

const isHttpUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const normalizeFrameValue = (value?: string | null) => {
  if (!value) return "";
  if (isHttpUrl(value)) return value;
  if (value.startsWith("souls/")) return value;
  if (value.startsWith("/")) return value.slice(1);
  if (value.includes("/")) return value;
  return `souls/profile/frames/${value}.webp`;
};

export const getProfileFrameUrl = (value?: string | null) => {
  const normalized = normalizeFrameValue(value);
  if (!normalized) return "";
  if (isHttpUrl(normalized)) return normalized;
  if (normalized.startsWith("profile/")) return `/${normalized}`;
  return toBlobUrl(normalized);
};

export const getProfileFrameValue = (value?: string | null) =>
  normalizeFrameValue(value);
