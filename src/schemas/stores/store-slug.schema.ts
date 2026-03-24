import { z } from "zod";

export const StoreSlugSchema = z
  .string()
  .trim()
  .min(1, "Slug inválido")
  .max(140, "Slug inválido");

export type StoreSlugInput = z.infer<typeof StoreSlugSchema>;
