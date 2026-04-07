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
    currentPassword: z
      .string()
      .min(8, "La contraseña actual debe tener al menos 8 caracteres."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
