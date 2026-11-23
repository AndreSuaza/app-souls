import { z } from "zod";

const optionalDate = z.coerce.date().optional().nullable();

export const CompetitiveSeasonIdSchema = z.object({
  seasonId: z.string().trim().min(1),
});

export const CompetitiveSeasonCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional().nullable(),
  startsAt: optionalDate,
  endsAt: optionalDate,
});

export const CompetitiveSeasonUpdateSchema = CompetitiveSeasonIdSchema.extend(
  CompetitiveSeasonCreateSchema.shape,
);

export const CompetitiveSeasonDashboardSchema = CompetitiveSeasonIdSchema.extend({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
});

export type CompetitiveSeasonCreateInput = z.input<
  typeof CompetitiveSeasonCreateSchema
>;
export type CompetitiveSeasonUpdateInput = z.input<
  typeof CompetitiveSeasonUpdateSchema
>;
