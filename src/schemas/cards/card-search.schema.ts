import { z } from "zod";

export const CardSearchSchema = z
  .object({
    text: z.string().trim().min(1).max(80).optional(),
    page: z.number().int().min(1).optional(),
    take: z.number().int().min(1).max(120).optional(),
  })
  .strict();

export type CardSearchInput = z.infer<typeof CardSearchSchema>;
