import { z } from "zod";
import { getPlainTextFromMarkdown } from "../../utils/markdown";

export const TournamentFormatEnum = z.enum(["Masters"]);

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
export const UpdateTournamentInfoSchema = z
  .object({
    tournamentId: z.string().min(1),

    title: z
      .string()
      .min(3, "El t\u00edtulo debe tener al menos 3 caracteres")
      .max(60, "El t\u00edtulo no puede superar los 60 caracteres"),

    description: z.string().optional(),
    typeTournamentName: z.string().optional(),

    date: z.date(),
    status: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.description === undefined) return;

    const plainText = getPlainTextFromMarkdown(data.description);
    const trimmed = plainText.trim();

    if (trimmed.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["description"],
        message: "La descripci\u00f3n es obligatoria",
      });
      return;
    }

    if (trimmed.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        type: "string",
        inclusive: true,
        minimum: 10,
        path: ["description"],
        message: "La descripci\u00f3n debe tener al menos 10 caracteres",
      });
      return;
    }

    const typeName = (data.typeTournamentName ?? "").toLowerCase();
    const maxLength =
      typeName.includes("tier 1") || typeName.includes("tier 2") ? 500 : 300;

    if (trimmed.length > maxLength) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        type: "string",
        inclusive: true,
        maximum: maxLength,
        path: ["description"],
        message: `La descripci\u00f3n no puede superar los ${maxLength} caracteres`,
      });
    }
  });

export type UpdateTournamentInfoInput = z.infer<
  typeof UpdateTournamentInfoSchema
>;

export const FinalizeTournamentSchema = z.object({
  tournamentId: z.string().min(1),
  players: z.array(
    z.object({
      userId: z.string().min(1),
      wins: z.number().int().min(0),
      matches: z.number().int().min(0),
    })
  ),
});

export type FinalizeTournamentInput = z.infer<typeof FinalizeTournamentSchema>;





