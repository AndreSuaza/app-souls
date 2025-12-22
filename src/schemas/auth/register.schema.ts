import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Debe tener al menos 8 caracteres")
  .refine((v) => /[A-Z]/.test(v), {
    message: "Debe contener una mayuscula",
  })
  .refine((v) => /\d/.test(v), {
    message: "Debe contener un numero",
  })
  .refine((v) => /[!@#$%^&*(),.?\":{}|<>]/.test(v), {
    message: "Debe contener un caracter especial",
  });

export const RegisterSchema = z
  .object({
    name: z.string().min(3).max(15),
    lastname: z.string().min(3).max(15),
    nickname: z.string().min(3).max(15),
    image: z.string().optional(),
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;
