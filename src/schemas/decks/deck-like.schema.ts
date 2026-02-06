import { z } from "zod";

export const DeckLikeSchema = z.object({
  deckId: z.string().min(1, "El id del mazo es requerido"),
  like: z.boolean(),
});

export type DeckLikeInput = z.infer<typeof DeckLikeSchema>;
