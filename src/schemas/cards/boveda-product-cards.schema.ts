import { z } from "zod";

export const BovedaProductCardsSchema = z
  .object({
    cardId: z
      .string()
      .trim()
      .min(1, "El id de la carta es obligatorio.")
      .max(40, "El id de la carta es invalido."),
    page: z.coerce.number().int().min(1).optional().default(1),
  })
  .strict();

export type BovedaProductCardsInput = z.infer<typeof BovedaProductCardsSchema>;
