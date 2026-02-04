import { z } from "zod";

export const DeleteDeckSchema = z.object({
  deckId: z.string().min(1, "ID inválido"),
});

export type DeleteDeckInput = z.infer<typeof DeleteDeckSchema>;
