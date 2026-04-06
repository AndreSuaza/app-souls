const RAW_BLOB_BASE_URL = process.env.NEXT_PUBLIC_BLOB_BASE_URL ?? "";

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

export const blobBaseUrl = normalizeBaseUrl(RAW_BLOB_BASE_URL);

const isHttpUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

export const toBlobUrl = (value?: string | null): string => {
  if (!value) return "";
  if (value.startsWith("/")) return value;
  if (isHttpUrl(value)) return value;
  if (!blobBaseUrl) return value;
  const normalized = value.replace(/^\/+/, "");
  return `${blobBaseUrl}/${normalized}`;
};

export const toBlobPath = (value?: string | null): string => {
  if (!value) return "";
  if (value.startsWith("/")) return value.replace(/^\/+/, "");
  if (!isHttpUrl(value)) return value;

  try {
    const url = new URL(value);
    return url.pathname.replace(/^\/+/, "");
  } catch {
    return value;
  }
};

export const isBlobValue = (value?: string | null) => {
  if (!value) return false;
  if (value.startsWith("souls/")) return true;
  if (!isHttpUrl(value)) return false;

  try {
    const url = new URL(value);
    if (blobBaseUrl) {
      return url.origin === new URL(blobBaseUrl).origin;
    }
    return url.hostname.includes("vercel-storage.com");
  } catch {
    return false;
  }
};
