import { z } from "zod";

export const ProfileBannerSchema = z.object({
  bannerImage: z.string().min(1, "El banner es requerido."),
});

export type ProfileBannerInput = z.infer<typeof ProfileBannerSchema>;
