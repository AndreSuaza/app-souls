import { z } from "zod";

export const ProfileTournamentSchema = z.object({
  tournamentId: z.string().min(1, "El id del torneo es requerido."),
});
