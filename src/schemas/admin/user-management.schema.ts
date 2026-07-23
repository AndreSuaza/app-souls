import { z } from "zod";

export const AdminUserRoleSchema = z.enum([
  "player",
  "admin",
  "store",
  "news",
]);

export const AdminUserStatusSchema = z.enum(["active", "inactive", "banned"]);

export const AdminUserIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "El usuario seleccionado no es valido.");

export const AdminUsersFiltersSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  perPage: z.number().int().min(1).max(100).optional().default(10),
  query: z.string().trim().max(100).optional().default(""),
  role: z.union([z.literal("all"), AdminUserRoleSchema]).optional().default("all"),
  status: z
    .union([z.literal("all"), AdminUserStatusSchema])
    .optional()
    .default("all"),
  order: z
    .enum([
      "recent",
      "oldest",
      "name-asc",
      "name-desc",
      "pv-desc",
      "pv-asc",
      "elo-desc",
      "elo-asc",
    ])
    .optional()
    .default("recent"),
});

export const UpdateAdminUserRoleStatusSchema = z.object({
  userId: AdminUserIdSchema,
  role: AdminUserRoleSchema,
  status: AdminUserStatusSchema,
});

export const SetAdminUserActiveStatusSchema = z.object({
  userId: AdminUserIdSchema,
  active: z.boolean(),
});

export const AdminUserEmailActionSchema = z.object({
  userId: AdminUserIdSchema,
});

export const AdjustUserVictoryPointsSchema = z.object({
  userId: AdminUserIdSchema,
  amount: z
    .number()
    .int("El ajuste debe ser un numero entero.")
    .refine((value) => value !== 0, "El ajuste no puede ser 0."),
  reason: z
    .string()
    .trim()
    .min(5, "El motivo debe tener al menos 5 caracteres.")
    .max(240, "El motivo no puede superar 240 caracteres."),
});

export const BULK_ADJUST_USER_PV_MAX_USERS = 100;

export const BulkAdjustUserVictoryPointsSchema = z.object({
  selection: z.object({
    mode: z.literal("selected"),
    userIds: z
      .array(AdminUserIdSchema)
      .min(1, "Selecciona al menos un usuario.")
      .max(
        BULK_ADJUST_USER_PV_MAX_USERS,
        `No puedes ajustar mas de ${BULK_ADJUST_USER_PV_MAX_USERS} usuarios seleccionados a la vez.`,
      )
      .transform((ids) => Array.from(new Set(ids))),
  }),
  amount: z
    .number()
    .int("El ajuste debe ser un numero entero.")
    .min(1, "La cantidad de PV debe ser mayor a 0."),
  reason: z
    .string()
    .trim()
    .min(5, "El motivo debe tener al menos 5 caracteres.")
    .max(240, "El motivo no puede superar 240 caracteres."),
});

export const UserPvAdjustmentsSchema = z.object({
  userId: AdminUserIdSchema,
  limit: z.number().int().min(1).max(20).optional().default(10),
});
