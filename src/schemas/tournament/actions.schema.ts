import { z } from "zod";
import { CreateTournamentSchema } from "./tournament.schema";
import { UpdateTournamentInfoSchema } from "./tournament.schema";
import { TournamentPlayerSchema } from "./player.schema";
import { GenerateRoundSchema, FinalizeRoundSchema } from "./round.schema";
import { SaveMatchSchema } from "./match.schema";

// Schema genérico para IDs usados en acciones de torneo
export const IdSchema = z.string().min(1, "ID inválido");

export const Schemas = {
  createTournament: CreateTournamentSchema,
  updateTournament: UpdateTournamentInfoSchema,
  addPlayer: TournamentPlayerSchema,
  generateRound: GenerateRoundSchema,
  finalizeRound: FinalizeRoundSchema,
  saveMatchResult: SaveMatchSchema,
};

export type SchemaMap = typeof Schemas;
