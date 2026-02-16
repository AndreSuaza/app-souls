import { z } from "zod";

export const DeckSearchSchema = z
  .object({
    text: z.string().trim().min(1).max(80).optional(),
    page: z.number().int().min(1).optional(),
    take: z.number().int().min(1).max(60).optional(),
  })
  .strict();

export type DeckSearchInput = z.infer<typeof DeckSearchSchema>;
