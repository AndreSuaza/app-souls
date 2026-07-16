const RAW_ASSETS_BASE_URL = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? "";
const RAW_BLOB_BASE_URL = process.env.NEXT_PUBLIC_BLOB_BASE_URL ?? "";

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

export const assetsBaseUrl = normalizeBaseUrl(RAW_ASSETS_BASE_URL);
export const blobBaseUrl = normalizeBaseUrl(RAW_BLOB_BASE_URL);
export const storageBaseUrl = assetsBaseUrl || blobBaseUrl;

const LEGACY_VERCEL_STORAGE_HOST = "vercel-storage.com";

const MIGRATED_PUBLIC_PREFIXES = ["cards/", "products/", "profile/"] as const;

const isHttpUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const isLegacyVercelStorageUrl = (url: URL) =>
  url.hostname === LEGACY_VERCEL_STORAGE_HOST ||
  url.hostname.endsWith(`.${LEGACY_VERCEL_STORAGE_HOST}`);

const isSameOrigin = (url: URL, baseUrl: string) => {
  if (!baseUrl) return false;
  try {
    return url.origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
};

const getPathFromUrl = (value: string) => {
  try {
    return new URL(value).pathname.replace(/^\/+/, "");
  } catch {
    return value;
  }
};

const toStorageUrl = (path: string) => {
  const normalized = path.replace(/^\/+/, "");
  if (!storageBaseUrl) return path.startsWith("/") ? path : normalized;
  return `${storageBaseUrl}/${normalized}`;
};

export const toBlobUrl = (value?: string | null): string => {
  if (!value) return "";
  if (value.startsWith("/")) return value;
  if (isHttpUrl(value)) {
    try {
      const url = new URL(value);
      if (isLegacyVercelStorageUrl(url) || isSameOrigin(url, blobBaseUrl)) {
        return toStorageUrl(url.pathname);
      }
    } catch {
      return value;
    }

    return value;
  }
  return toStorageUrl(value);
};

export const toAssetUrl = (value?: string | null): string => {
  if (!value) return "";
  if (isHttpUrl(value)) return toBlobUrl(value);

  const normalized = value.replace(/^\/+/, "");
  if (
    value.startsWith("/") &&
    !MIGRATED_PUBLIC_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  ) {
    return value;
  }

  return toStorageUrl(normalized);
};

export const toBlobPath = (value?: string | null): string => {
  if (!value) return "";
  if (value.startsWith("/")) return value.replace(/^\/+/, "");
  if (!isHttpUrl(value)) return value.replace(/^\/+/, "");
  return getPathFromUrl(value);
};

export const isBlobValue = (value?: string | null) => {
  if (!value) return false;
  if (value.startsWith("souls/")) return true;
  if (!isHttpUrl(value)) return false;

  try {
    const url = new URL(value);
    return (
      isSameOrigin(url, assetsBaseUrl) ||
      isSameOrigin(url, blobBaseUrl) ||
      isLegacyVercelStorageUrl(url)
    );
  } catch {
    return false;
  }
};
