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

export const MatchUpdateSchema = z.object({
  id: z.string(),
  player1Id: z.string(),
  player1Nickname: z.string(),
  player2Id: z.string().nullable(),
  player2Nickname: z.string().nullable(),
  result: z.enum(["P1", "P2", "DRAW"]).nullable(),
});

export const DeletePlayerSchema = z.object({
  playerId: z.string(),
  matchDeleteId: z.string().nullable().optional(),
  matchUpdate: MatchUpdateSchema.nullable().optional(),
});

export type DeletePlayerInput = z.infer<typeof DeletePlayerSchema>;
