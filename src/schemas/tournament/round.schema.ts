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

export const RecalculateRoundSchema = z.object({
  tournamentId: z.string().min(1, "El ID del torneo es requerido"),
  roundId: z.string().min(1, "El ID de la ronda es requerido"),
  currentRoundNumber: z.number().int().min(0),
  players: z
    .array(
      z.object({
        id: z.string().min(1),
        playerNickname: z.string().min(1),
        points: z.number(),
        hadBye: z.boolean(),
        rivals: z.array(z.string()),
      })
    )
    .min(1, "No hay jugadores para recalcular la ronda"),
});

export type GenerateRoundInput = z.infer<typeof GenerateRoundSchema>;
export type FinalizeRoundInput = z.infer<typeof FinalizeRoundSchema>;
export type RecalculateRoundInput = z.infer<typeof RecalculateRoundSchema>;
