const RAW_ASSETS_BASE_URL = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? "";

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

export const assetsBaseUrl = normalizeBaseUrl(RAW_ASSETS_BASE_URL);
export const storageBaseUrl = assetsBaseUrl;

const PUBLIC_ASSET_PREFIXES = ["cards/", "products/", "profile/"] as const;

const isHttpUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

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

const stripQueryAndHash = (value: string) => value.split(/[?#]/, 1)[0] ?? "";

const toStorageUrl = (path: string) => {
  const normalized = path.replace(/^\/+/, "");
  if (!storageBaseUrl) return path.startsWith("/") ? path : normalized;
  return `${storageBaseUrl}/${normalized}`;
};

export const toAssetStorageUrl = (value?: string | null): string => {
  if (!value) return "";
  if (value.startsWith("/")) return value;
  if (isHttpUrl(value)) {
    return value;
  }
  return toStorageUrl(value);
};

const PRODUCT_ASSET_VERSION =
  process.env.NEXT_PUBLIC_PRODUCT_ASSETS_VERSION ?? "20260723-hq";

const withQueryParam = (url: string, key: string, value: string) => {
  if (!url || !value) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
};

const normalizeProductImagePath = (pathname: string) => {
  const match = pathname.match(/^products\/([^/]+)\.([a-z0-9]+)$/i);
  if (!match) return pathname;

  const [, name, extension] = match;
  return `products/${name.toLowerCase()}.${extension.toLowerCase()}`;
};

export const toProductImageUrl = (value?: string | null): string => {
  const normalizedValue =
    value && !isHttpUrl(value)
      ? normalizeProductImagePath(value.replace(/^\/+/, ""))
      : value;
  const url = toAssetStorageUrl(normalizedValue);
  if (!url) return "";

  const pathname = toAssetPath(url);
  if (!pathname.startsWith("products/")) return url;

  return withQueryParam(url, "v", PRODUCT_ASSET_VERSION);
};

export const toAssetUrl = (value?: string | null): string => {
  if (!value) return "";
  if (isHttpUrl(value)) return toAssetStorageUrl(value);

  const normalized = value.replace(/^\/+/, "");
  if (
    value.startsWith("/") &&
    !PUBLIC_ASSET_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  ) {
    return value;
  }

  return toStorageUrl(normalized);
};

export const toAssetPath = (value?: string | null): string => {
  if (!value) return "";
  if (value.startsWith("/")) return stripQueryAndHash(value).replace(/^\/+/, "");
  if (!isHttpUrl(value)) return stripQueryAndHash(value).replace(/^\/+/, "");
  return getPathFromUrl(value);
};

export const isStoredAssetValue = (value?: string | null) => {
  if (!value) return false;
  if (value.startsWith("souls/")) return true;
  if (!isHttpUrl(value)) return false;

  try {
    const url = new URL(value);
    return isSameOrigin(url, assetsBaseUrl);
  } catch {
    return false;
  }
};
