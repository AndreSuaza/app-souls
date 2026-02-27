import { z } from "zod";

export const StoresByDistanceSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(50).default(10),
});

export type StoresByDistanceInput = z.infer<typeof StoresByDistanceSchema>;
