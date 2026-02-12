import { z } from "zod";

export const CardImagesSchema = z.object({}).strict();

export type CardImagesInput = z.infer<typeof CardImagesSchema>;
