import { z } from "zod";

export const PublicUserIdSchema = z.object({
  userId: z.string().min(1, "El usuario es requerido."),
});

export type PublicUserIdInput = z.infer<typeof PublicUserIdSchema>;
