import { z } from "zod";

const mongoId = z.string().trim().regex(/^[a-f\d]{24}$/i, "El identificador no es valido.");

export const AdminCardOwnershipUserIdSchema = mongoId;

export const AdminCardOwnershipSearchSchema = z.object({
  userId: mongoId,
  text: z.string().trim().max(100).optional().default(""),
  limit: z.number().int().min(1).max(100).optional().default(30),
});

export const AdminCardOwnershipChangeSchema = z.object({
  userId: mongoId,
  cardId: mongoId,
  note: z.string().trim().max(240).optional().default(""),
});

export const AdminBulkCardOwnershipChangeSchema = z.object({
  userIds: z.array(mongoId).min(1).max(100).transform((ids) => Array.from(new Set(ids))),
  cardId: mongoId,
  note: z.string().trim().max(240).optional().default(""),
});

export const AdminCardOwnershipHistorySchema = z.object({
  userId: mongoId,
  limit: z.number().int().min(1).max(50).optional().default(20),
});

export type AdminCardOwnershipSearchInput = z.infer<typeof AdminCardOwnershipSearchSchema>;
