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
  perPage: z.number().int().min(1).max(50).optional().default(10),
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

export const UserPvAdjustmentsSchema = z.object({
  userId: AdminUserIdSchema,
  limit: z.number().int().min(1).max(20).optional().default(10),
});
