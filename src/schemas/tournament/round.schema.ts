import { z } from "zod";

// GenerateRoundSchema: se usa antes de crear una nueva ronda Swiss.
export const GenerateRoundSchema = z.object({
  tournamentId: z.string().min(1, "El ID del torneo es requerido"),
});

// FinalizeRoundSchema: se usa para cerrar una ronda Swiss.
export const FinalizeRoundSchema = z.object({
  roundId: z.string().min(1),
  tournamentId: z.string().min(1),
});

export type GenerateRoundInput = z.infer<typeof GenerateRoundSchema>;
export type FinalizeRoundInput = z.infer<typeof FinalizeRoundSchema>;
