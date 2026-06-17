import { z } from "zod";

export const MediaSectionSchema = z.enum([
  "news-banners",
  "news-cards",
  "event-banners",
  "event-cards",
  "profile-avatars",
  "profile-banners",
  "profile-frames",
  "products",
  "cards",
]);

export type MediaSectionInput = z.infer<typeof MediaSectionSchema>;
