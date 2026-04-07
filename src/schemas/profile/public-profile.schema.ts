import { z } from "zod";

export const PublicProfileSchema = z.object({
  nickname: z
    .string()
    .min(2, "El nickname es obligatorio.")
    .max(30, "El nickname es demasiado largo.")
    .transform((value) => value.trim().toLowerCase()),
});

export type PublicProfileInput = z.infer<typeof PublicProfileSchema>;
