import { z } from "zod";

export const MediaSectionSchema = z.enum([
  "news-banners",
  "news-cards",
  "profile-avatars",
  "profile-banners",
  "products",
  "cards",
]);

export type MediaSectionInput = z.infer<typeof MediaSectionSchema>;
