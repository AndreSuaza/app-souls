import { z } from "zod";

const MAX_IMAGES_ZIP_SIZE_MB = 70;
const MAX_IMAGES_ZIP_SIZE_BYTES = MAX_IMAGES_ZIP_SIZE_MB * 1024 * 1024;

export const CardImagesBulkUpdateSchema = z.object({
  imagesZip: z
    .instanceof(File, { message: "Debes adjuntar un ZIP de imagenes." })
    .refine((file) => file.size > 0, "El ZIP de imagenes esta vacio.")
    .refine(
      (file) => file.size <= MAX_IMAGES_ZIP_SIZE_BYTES,
      `El ZIP de imagenes supera ${MAX_IMAGES_ZIP_SIZE_MB}MB.`,
    )
    .refine(
      (file) => file.name.toLowerCase().endsWith(".zip"),
      "El archivo de imagenes debe ser .zip",
    ),
});

export type CardImagesBulkUpdateInput = z.infer<
  typeof CardImagesBulkUpdateSchema
>;
