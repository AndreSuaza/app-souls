import { z } from "zod";

export const TournamentFormatEnum = z.enum(["default", "Masters"]);

// Schema usado para agregar jugadores a un torneo.
// - "pointsInitial" representa los puntos otorgados a un jugador que entra tarde
//   (late join), solamente si el torneo ya tiene rondas generadas.
export const CreateTournamentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
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

/**
 * Schema para actualizar información básica del torneo
 * - No incluye campos que no son editables
 */
export const UpdateTournamentInfoSchema = z.object({
  tournamentId: z.string().min(1),

  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(50, "El título no puede superar los 50 caracteres"),

  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(300, "La descripción no puede superar los 300 caracteres")
    .optional(),

  date: z.date(),
  status: z.string(),
});

export type UpdateTournamentInfoInput = z.infer<
  typeof UpdateTournamentInfoSchema
>;
