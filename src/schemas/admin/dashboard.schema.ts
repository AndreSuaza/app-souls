import { z } from "zod";

const dateParam = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

export const AdminDashboardFiltersSchema = z
  .object({
    from: dateParam.optional(),
    to: dateParam.optional(),
    preset: z.enum(["7", "30", "90", "custom"]).optional(),
    storeId: z.string().trim().regex(/^[a-f0-9]{24}$/i, "Tienda inválida").optional(),
    format: z.enum(["all", "Masters", "Elimination"]).optional(),
    status: z
      .enum(["all", "pending", "in_progress", "finished", "cancelled"])
      .optional(),
    role: z.enum(["all", "admin", "store", "news", "player"]).optional(),
    userStatus: z.enum(["all", "active", "inactive", "banned"]).optional(),
    mode: z.string().trim().min(1).optional(),
    matchMode: z.string().trim().min(1).optional(),
    simulatorStatus: z.string().trim().min(1).optional(),
  })
  .superRefine((value, context) => {
    if ((value.from && !value.to) || (!value.from && value.to)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes indicar ambas fechas.",
        path: [value.from ? "to" : "from"],
      });
    }

    if (value.from && value.to && value.from > value.to) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha inicial no puede ser posterior a la final.",
        path: ["from"],
      });
    }
  });

export type AdminDashboardFilters = z.infer<typeof AdminDashboardFiltersSchema>;

export const DEFAULT_DASHBOARD_DAYS = 30;
