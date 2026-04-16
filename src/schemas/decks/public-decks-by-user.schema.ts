import { z } from "zod";
import { DeckFiltersSchema } from "./deck-filters.schema";

export const PublicDecksByUserSchema = DeckFiltersSchema.extend({
  userId: z.string().min(1, "El usuario es requerido."),
});

export type PublicDecksByUserInput = z.input<
  typeof PublicDecksByUserSchema
>;
