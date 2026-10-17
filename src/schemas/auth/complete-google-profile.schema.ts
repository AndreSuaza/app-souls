import { z } from "zod";

export const CompleteGoogleProfileSchema = z.object({
  name: z.string().trim().min(3).max(15),
  lastname: z.string().trim().min(3).max(15),
  nickname: z.string().trim().min(3).max(10),
});

export type CompleteGoogleProfileInput = z.infer<
  typeof CompleteGoogleProfileSchema
>;
