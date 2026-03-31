export const AVATAR_TYPES = [
  { value: "AVATAR", label: "Avatar" },
  { value: "BANNER", label: "Banner" },
] as const;

export const AVATAR_RARITIES = [
  { value: "COMMON", label: "Comun" },
  { value: "RARE", label: "Raro" },
  { value: "EPIC", label: "Epico" },
  { value: "LEGENDARY", label: "Legendario" },
  { value: "EVENT", label: "Evento" },
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
