import { z } from "zod";

const ObjectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "El identificador no es valido.");

const BattlePassDateSchema = z.coerce.date();

const BattlePassBaseObjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "El titulo debe tener al menos 3 caracteres.")
    .max(90, "El titulo no puede superar 90 caracteres."),
  description: z
    .string()
    .trim()
    .max(320, "La descripcion no puede superar 320 caracteres.")
    .optional()
    .nullable()
    .transform((value) => value || null),
  seasonNumber: z
    .number()
    .int("La temporada debe ser un numero entero.")
    .min(1, "La temporada debe ser mayor o igual a 1."),
  startsAt: BattlePassDateSchema,
  endsAt: BattlePassDateSchema,
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  backgroundImageUrl: z
    .string()
    .trim()
    .max(500, "El fondo no puede superar 500 caracteres.")
    .optional()
    .nullable()
    .transform((value) => value || null),
});

const refineBattlePassDates = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine((value) => value.endsAt >= value.startsAt, {
    path: ["endsAt"],
    message: "La fecha de cierre debe ser igual o posterior al inicio.",
  });

export const CreateBattlePassSchema = refineBattlePassDates(
  BattlePassBaseObjectSchema,
);

export const UpdateBattlePassSchema = refineBattlePassDates(
  BattlePassBaseObjectSchema.extend({
    id: ObjectIdSchema,
  }),
);

export const BattlePassIdSchema = z.object({
  battlePassId: ObjectIdSchema,
});

export const BattlePassLevelIdSchema = z.object({
  levelId: ObjectIdSchema,
});

export const BattlePassClaimIdSchema = z.object({
  claimId: ObjectIdSchema,
});

export const ReorderBattlePassLevelsSchema = z.object({
  battlePassId: ObjectIdSchema,
  levelIds: z
    .array(ObjectIdSchema)
    .min(1, "Debes enviar al menos un nivel para reordenar."),
});

export const BattlePassRewardTypeSchema = z.enum([
  "AVATAR",
  "BANNER",
  "PV",
  "MANUAL",
]);

export const UpsertBattlePassLevelSchema = z
  .object({
    id: ObjectIdSchema.optional(),
    battlePassId: ObjectIdSchema,
    levelNumber: z
      .number()
      .int("El nivel debe ser un numero entero.")
      .min(1, "El nivel debe ser mayor o igual a 1."),
    title: z
      .string()
      .trim()
      .min(2, "El nombre del nivel es requerido.")
      .max(80, "El nombre del nivel no puede superar 80 caracteres."),
    description: z
      .string()
      .trim()
      .max(240, "La descripcion no puede superar 240 caracteres.")
      .optional()
      .nullable()
      .transform((value) => value || null),
    imageUrl: z
      .string()
      .trim()
      .max(500, "La imagen no puede superar 500 caracteres.")
      .optional()
      .nullable()
      .transform((value) => value || null),
    rewardType: BattlePassRewardTypeSchema,
    rewardAvatarId: ObjectIdSchema.optional().nullable(),
    victoryPointsReward: z
      .number()
      .int("Los PV deben ser un numero entero.")
      .min(0, "Los PV deben ser mayor o igual a 0.")
      .optional()
      .nullable(),
    manualRewardLabel: z
      .string()
      .trim()
      .max(80, "El texto del premio no puede superar 80 caracteres.")
      .optional()
      .nullable()
      .transform((value) => value || null),
  })
  .superRefine((value, ctx) => {
    if (
      (value.rewardType === "AVATAR" || value.rewardType === "BANNER") &&
      !value.rewardAvatarId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rewardAvatarId"],
        message: "Selecciona el cosmetico de la recompensa.",
      });
    }

    if (
      value.rewardType === "PV" &&
      (!value.victoryPointsReward || value.victoryPointsReward < 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["victoryPointsReward"],
        message: "La recompensa de PV debe ser mayor a 0.",
      });
    }

    if (value.rewardType === "MANUAL" && !value.manualRewardLabel) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["manualRewardLabel"],
        message: "Describe la recompensa manual.",
      });
    }
  });

export const ClaimBattlePassRewardSchema = z.object({
  levelId: ObjectIdSchema,
});

export type CreateBattlePassInput = z.infer<typeof CreateBattlePassSchema>;
export type UpdateBattlePassInput = z.infer<typeof UpdateBattlePassSchema>;
export type ReorderBattlePassLevelsInput = z.infer<
  typeof ReorderBattlePassLevelsSchema
>;
export type UpsertBattlePassLevelInput = z.infer<
  typeof UpsertBattlePassLevelSchema
>;
export type ClaimBattlePassRewardInput = z.infer<
  typeof ClaimBattlePassRewardSchema
>;
