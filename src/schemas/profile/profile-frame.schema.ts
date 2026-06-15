import { z } from "zod";

export const ProfileFrameSchema = z.object({
  frameImage: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    return value;
  }, z.string().min(1, "El marco es requerido.").nullable()),
});

export type ProfileFrameInput = z.infer<typeof ProfileFrameSchema>;
