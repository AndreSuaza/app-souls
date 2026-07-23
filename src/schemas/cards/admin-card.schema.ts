import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().finite().nullable(),
);

const idArray = z.array(z.string().trim().min(1)).default([]);

const BaseAdminCardSchema = z.object({
  idd: z
    .string()
    .trim()
    .min(1, "La numeracion es obligatoria")
    .max(30)
    .refine((value) => !/[\\/]/.test(value), "La numeracion no puede contener /"),
  code: z
    .string()
    .trim()
    .min(1, "El codigo es obligatorio")
    .max(80)
    .refine((value) => !/[\\/]/.test(value), "El codigo no puede contener /"),
  limit: z.string().trim().min(1, "El limite es obligatorio").max(40),
  rotation: z.coerce.number().int().min(0),
  cost: z.coerce.number().int().min(0),
  force: z.string().trim().max(40).default(""),
  defense: z.string().trim().max(40).default(""),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(160),
  effect: z.string().trim().max(5000).default(""),
  price: optionalNumber,
  productId: z.string().trim().min(1, "El producto es obligatorio"),
  typeIds: idArray.refine((value) => value.length > 0, "Selecciona al menos un tipo"),
  archetypesIds: idArray,
  keywordsIds: idArray,
  raritiesIds: idArray.refine(
    (value) => value.length > 0,
    "Selecciona al menos una rareza",
  ),
  imageUrl: z.string().trim().optional(),
});

export const CreateAdminCardSchema = BaseAdminCardSchema.extend({
  imageUrl: z.string().trim().min(1, "La imagen es obligatoria"),
});

export const UpdateAdminCardSchema = BaseAdminCardSchema.extend({
  cardId: z.string().trim().min(1, "El id de la carta es obligatorio"),
  imageUrl: z.string().trim().optional(),
});

export const DeleteAdminCardSchema = z
  .object({
    cardId: z.string().trim().min(1, "El id de la carta es obligatorio"),
  })
  .strict();

export const UploadCardImageSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "El codigo es obligatorio")
      .max(80)
      .refine((value) => !/[\\/]/.test(value), "El codigo no puede contener /"),
    idd: z
      .string()
      .trim()
      .min(1, "La numeracion es obligatoria")
      .max(30)
      .refine((value) => !/[\\/]/.test(value), "La numeracion no puede contener /"),
  })
  .strict();

export const AdminCardsFiltersSchema = z
  .object({
    text: z.string().trim().max(100).optional(),
    productId: z.string().trim().optional(),
    rarityId: z.string().trim().optional(),
    typeId: z.string().trim().optional(),
    archetypeId: z.string().trim().optional(),
    keywordId: z.string().trim().optional(),
    rotation: z.coerce.number().int().min(0).optional(),
    status: z.enum(["active", "deleted", "all"]).default("active"),
    image: z.enum(["all", "missing"]).default("all"),
    page: z.coerce.number().int().min(1).default(1),
    take: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type CreateAdminCardInput = z.infer<typeof CreateAdminCardSchema>;
export type UpdateAdminCardInput = z.infer<typeof UpdateAdminCardSchema>;
export type DeleteAdminCardInput = z.infer<typeof DeleteAdminCardSchema>;
export type UploadCardImageInput = z.infer<typeof UploadCardImageSchema>;
export type AdminCardsFiltersInput = z.infer<typeof AdminCardsFiltersSchema>;
