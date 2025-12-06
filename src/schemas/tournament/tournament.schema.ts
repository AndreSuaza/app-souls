import { z } from "zod";

export const TournamentFormatEnum = z.enum([
  "default",
  "constructed",
  "sealed",
  "draft",
  "commander",
]);

// Schema usado para agregar jugadores a un torneo.
// - "pointsInitial" representa los puntos otorgados a un jugador que entra tarde
//   (late join), solamente si el torneo ya tiene rondas generadas.
export const CreateTournamentSchema = z.object({
  title: z.string().min(1),
  descripcion: z.string().min(1),
  url: z.string().min(1),
  lat: z.number(),
  lgn: z.number(),
  format: TournamentFormatEnum,
  date: z.string().or(z.date()),
  image: z.string().optional(),

  maxRounds: z.number().min(1),

  storeId: z.string(),
  typeTournamentId: z.string(),
});

export type CreateTournamentInput = z.infer<typeof CreateTournamentSchema>;
