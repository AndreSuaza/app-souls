import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Debe tener al menos 8 caracteres")
  .refine((value) => /[A-Z]/.test(value), {
    message: "Debe contener una mayuscula",
  })
  .refine((value) => /\d/.test(value), {
    message: "Debe contener un numero",
  })
  .refine((value) => /[!@#$%^&*(),.?\":{}|<>]/.test(value), {
    message: "Debe contener un caracter especial",
  });

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().default(""),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
