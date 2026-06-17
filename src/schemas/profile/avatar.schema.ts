import { z } from "zod";

export const AvatarTypeSchema = z.enum(["AVATAR", "BANNER", "FRAME"]);
export const AvatarRaritySchema = z.enum([
  "COMMON",
  "RARE",
  "ULTRA",
  "SECRET",
  "ASCENDED",
]);
export const AvatarAvailabilitySchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return "PUBLIC";
    }
    return value;
  },
  z.enum(["PUBLIC", "STORE", "EVENT", "TOURNAMENT", "EXCLUSIVE"]),
);

const AvatarPriceSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return 0;
    }
    return value;
  },
  z.coerce
    .number()
    .int("El precio debe ser un numero entero.")
    .min(0, "El precio debe ser mayor o igual a 0."),
);

const AvatarBooleanSchema = z.preprocess((value) => {
  if (typeof value === "string") {
    return value === "true" || value === "on";
  }
  return Boolean(value);
}, z.boolean());

const AvatarSeasonNumberSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  return value;
}, z.coerce.number().int("La temporada debe ser un numero entero.").min(1, "La temporada debe ser mayor o igual a 1.").nullable());

const AvatarSeasonEndsAtSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }
  return value;
}, z.coerce.date().nullable());

const AvatarFeaturedOrderSchema = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return 0;
    }
    return value;
  },
  z.coerce
    .number()
    .int("El orden destacado debe ser un numero entero.")
    .min(0, "El orden destacado debe ser mayor o igual a 0."),
);

export const AvatarSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  imageUrl: z.string().min(1, "La imagen es requerida."),
  rarity: AvatarRaritySchema,
  availability: AvatarAvailabilitySchema.default("PUBLIC"),
  price: AvatarPriceSchema,
  type: AvatarTypeSchema,
  storeVisible: AvatarBooleanSchema.default(true),
  isSeasonal: AvatarBooleanSchema.default(false),
  seasonNumber: AvatarSeasonNumberSchema,
  seasonEndsAt: AvatarSeasonEndsAtSchema,
  featured: AvatarBooleanSchema.default(false),
  featuredOrder: AvatarFeaturedOrderSchema.default(0),
});

export const ProfileAvatarSchema = z.object({
  avatarImage: z.string().min(1, "El avatar es requerido."),
});

export const AvatarUpdateSchema = z.object({
  id: z.string().min(1, "El avatar es requerido."),
  name: z.string().min(2, "El nombre es requerido."),
  rarity: AvatarRaritySchema,
  availability: AvatarAvailabilitySchema.default("PUBLIC"),
  price: AvatarPriceSchema,
  storeVisible: AvatarBooleanSchema.default(true),
  isSeasonal: AvatarBooleanSchema.default(false),
  seasonNumber: AvatarSeasonNumberSchema,
  seasonEndsAt: AvatarSeasonEndsAtSchema,
  featured: AvatarBooleanSchema.default(false),
  featuredOrder: AvatarFeaturedOrderSchema.default(0),
});

export type AvatarInput = z.infer<typeof AvatarSchema>;
export type AvatarUpdateInput = z.infer<typeof AvatarUpdateSchema>;
export type ProfileAvatarInput = z.infer<typeof ProfileAvatarSchema>;
export type AvatarType = z.infer<typeof AvatarTypeSchema>;
export type AvatarRarity = z.infer<typeof AvatarRaritySchema>;
export type AvatarAvailability = z.infer<typeof AvatarAvailabilitySchema>;
