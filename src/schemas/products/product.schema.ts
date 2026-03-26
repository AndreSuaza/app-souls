import { z } from "zod";

const BaseProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres"),
  code: z.string().min(1, "Selecciona una imagen del producto"),
  releaseDate: z.string().min(1, "La fecha de lanzamiento es obligatoria"),
  price: z.number().min(0, "El precio debe ser un valor v?lido"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  url: z.string().min(1, "La URL es obligatoria"),
  show: z.boolean().optional().default(true),
  deckId: z.string().min(1, "Debes seleccionar un mazo"),
  numberCards: z.number().int().min(0, "El número de cartas debe ser válido"),
});

export const CreateProductSchema = BaseProductSchema.extend({
  index: z
    .number()
    .int()
    .min(1, "El índice debe ser un número positivo")
    .optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = BaseProductSchema.extend({
  productId: z.string().min(1),
  index: z.number().int().min(1, "El índice debe ser un número positivo"),
});

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
