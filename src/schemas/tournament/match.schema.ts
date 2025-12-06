import { z } from "zod";

export const MatchResultEnum = z.enum(["P1", "P2", "DRAW"]);

export const SaveMatchSchema = z.object({
  matchId: z.string().min(1),
  result: MatchResultEnum,
});

export type SaveMatchInput = z.infer<typeof SaveMatchSchema>;
