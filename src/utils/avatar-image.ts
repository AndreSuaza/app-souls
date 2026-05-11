import { toBlobUrl } from "@/utils/blob-path";

const DEFAULT_AVATAR_PATH =
  "souls/profile/avatars/player-f2fea397-2187-4000-b3da-55ef33376457.webp";

const isHttpUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const normalizeAvatarValue = (value?: string | null) => {
  if (!value) return DEFAULT_AVATAR_PATH;
  if (isHttpUrl(value)) return value;
  if (value.startsWith("souls/")) return value;
  if (value.startsWith("/")) return value.slice(1);
  if (value.includes("/")) return value;
  // Si llega un valor corto/legacy, usamos el avatar default para evitar 404.
  return DEFAULT_AVATAR_PATH;
};

export const getAvatarUrl = (value?: string | null) => {
  const normalized = normalizeAvatarValue(value);
  if (isHttpUrl(normalized)) return normalized;
  if (normalized.startsWith("profile/")) return `/${normalized}`;
  return toBlobUrl(normalized);
};

export const getAvatarValue = (value?: string | null) =>
  normalizeAvatarValue(value);
