import { z } from "zod";

export const AvatarTypeSchema = z.enum(["AVATAR", "BANNER"]);
export const AvatarRaritySchema = z.enum([
  "COMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "EVENT",
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
  z
    .coerce
    .number()
    .int("El precio debe ser un numero entero.")
    .min(0, "El precio debe ser mayor o igual a 0."),
);

export const AvatarSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  imageUrl: z.string().min(1, "La imagen es requerida."),
  rarity: AvatarRaritySchema,
  availability: AvatarAvailabilitySchema.default("PUBLIC"),
  price: AvatarPriceSchema,
  type: AvatarTypeSchema,
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
});

export type AvatarInput = z.infer<typeof AvatarSchema>;
export type AvatarUpdateInput = z.infer<typeof AvatarUpdateSchema>;
export type ProfileAvatarInput = z.infer<typeof ProfileAvatarSchema>;
export type AvatarType = z.infer<typeof AvatarTypeSchema>;
export type AvatarRarity = z.infer<typeof AvatarRaritySchema>;
export type AvatarAvailability = z.infer<typeof AvatarAvailabilitySchema>;
