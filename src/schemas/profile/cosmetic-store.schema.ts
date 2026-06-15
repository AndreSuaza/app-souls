import { z } from "zod";

export const CosmeticPurchaseSchema = z.object({
  cosmeticId: z.string().min(1, "El cosmético es requerido."),
});

export type CosmeticPurchaseInput = z.infer<typeof CosmeticPurchaseSchema>;
