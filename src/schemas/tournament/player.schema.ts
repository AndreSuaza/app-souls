import { z } from "zod";

export const TournamentPlayerSchema = z.object({
  tournamentId: z.string(),
  userId: z.string(),
  playerNickname: z.string().min(1).max(30),
  name: z.string().optional(),
  lastname: z.string().optional(),
  image: z.string().optional(),
  pointsInitial: z.number().optional(),
});

export type TournamentPlayerInput = z.infer<typeof TournamentPlayerSchema>;
