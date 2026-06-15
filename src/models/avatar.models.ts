export const AVATAR_TYPES = [
  { value: "AVATAR", label: "Avatar" },
  { value: "BANNER", label: "Banner" },
  { value: "FRAME", label: "Marco" },
] as const;

export const AVATAR_RARITIES = [
  { value: "COMMON", label: "Comun" },
  { value: "RARE", label: "Raro" },
  { value: "ULTRA", label: "Ultra" },
  { value: "SECRET", label: "Secreta" },
  { value: "ASCENDED", label: "Ascendida" },
] as const;

export const AVATAR_AVAILABILITIES = [
  { value: "PUBLIC", label: "Publico" },
  { value: "STORE", label: "Tienda" },
  { value: "EVENT", label: "Evento" },
  { value: "TOURNAMENT", label: "Torneo" },
  { value: "EXCLUSIVE", label: "Exclusivo" },
] as const;

export type AvatarTypeValue = (typeof AVATAR_TYPES)[number]["value"];
export type AvatarRarityValue = (typeof AVATAR_RARITIES)[number]["value"];
export type AvatarAvailabilityValue =
  (typeof AVATAR_AVAILABILITIES)[number]["value"];

const AVATAR_RARITY_LABEL_MAP: Record<string, string> = {
  COMMON: "Comun",
  RARE: "Raro",
  ULTRA: "Ultra",
  SECRET: "Secreta",
  ASCENDED: "Ascendida",
};

export const normalizeAvatarRarity = (
  value: string | null | undefined,
): AvatarRarityValue => {
  const mapped = value ?? "COMMON";
  const exists = AVATAR_RARITIES.some((item) => item.value === mapped);
  return exists ? (mapped as AvatarRarityValue) : "COMMON";
};

export const resolveAvatarRarityLabel = (value: string | null | undefined) =>
  AVATAR_RARITY_LABEL_MAP[value ?? ""] ?? "Comun";
