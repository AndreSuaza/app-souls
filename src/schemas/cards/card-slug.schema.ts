import { z } from "zod";

export const CardSlugSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1, "El slug de la carta es obligatorio.")
      .max(140, "El slug de la carta es invalido."),
  })
  .strict();

export type CardSlugInput = z.infer<typeof CardSlugSchema>;
