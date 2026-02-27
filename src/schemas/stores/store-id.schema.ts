import { z } from "zod";

export const StoreIdSchema = z.string().min(1, "ID inválido");

export type StoreIdInput = z.infer<typeof StoreIdSchema>;
