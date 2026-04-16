import { z } from "zod";

export const VerifyCurrentPasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(8, "La contraseña actual debe tener al menos 8 caracteres."),
});

export type VerifyCurrentPasswordInput = z.infer<
  typeof VerifyCurrentPasswordSchema
>;
