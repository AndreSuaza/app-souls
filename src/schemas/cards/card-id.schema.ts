import { z } from "zod";

export const CardIdSchema = z
  .object({
    cardId: z
      .string()
      .trim()
      .min(1, "El id de la carta es obligatorio.")
      .max(40, "El id de la carta es invalido."),
  })
  .strict();

export type CardIdInput = z.infer<typeof CardIdSchema>;
