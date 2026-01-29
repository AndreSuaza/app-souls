import { z } from "zod";

export const SaveDeckSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del mazo es requerido")
    .max(20, "El nombre no puede superar 20 caracteres"),
  description: z
    .string()
    .max(500, "La descripción no puede superar 500 caracteres")
    .optional()
    .nullable(),
  archetypesId: z.string().min(1, "El arquetipo es requerido"),
  visible: z.boolean(),
  cardsNumber: z.number().min(0),
  deckList: z.string().min(1),
  imgDeck: z.string().min(1),
  deckId: z.string().optional(),
});

export type SaveDeckInput = z.infer<typeof SaveDeckSchema>;
