import { z } from "zod";

// Valida y normaliza los filtros usados en la biblioteca de mazos.
export const DeckFiltersSchema = z.object({
  tournament: z.enum(["all", "with", "without"]).default("all"),
  archetypeId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  date: z.enum(["recent", "old"]).default("recent"),
  page: z.preprocess((value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 1) return 1;
    return Math.floor(parsed);
  }, z.number().int().min(1).default(1)),
  likes: z.preprocess(
    (value) => value === true || value === "true" || value === "1",
    z.boolean().default(false)
  ),
});

export type DeckFiltersInput = z.input<typeof DeckFiltersSchema>;

