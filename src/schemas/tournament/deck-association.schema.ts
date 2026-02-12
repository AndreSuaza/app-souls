import { z } from "zod";
import { IdSchema } from "./actions.schema";

export const AssociateTournamentDeckSchema = z.object({
  tournamentId: IdSchema,
  deckId: IdSchema,
});

export type AssociateTournamentDeckInput = z.infer<
  typeof AssociateTournamentDeckSchema
>;

export const RemoveTournamentDeckSchema = z.object({
  tournamentId: IdSchema,
  tournamentPlayerId: IdSchema,
});

export type RemoveTournamentDeckInput = z.infer<
  typeof RemoveTournamentDeckSchema
>;
