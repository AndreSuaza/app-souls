import { z } from "zod";

const MAX_EXCEL_SIZE_MB = 8;
const MAX_EXCEL_SIZE_BYTES = MAX_EXCEL_SIZE_MB * 1024 * 1024;
const MAX_IMAGES_ZIP_SIZE_MB = 70;
const MAX_IMAGES_ZIP_SIZE_BYTES =
  MAX_IMAGES_ZIP_SIZE_MB * 1024 * 1024;

export const CardExcelImportSchema = z.object({
  file: z
    .instanceof(File, { message: "Debes adjuntar un archivo Excel." })
    .refine((file) => file.size > 0, "El archivo esta vacio.")
    .refine(
      (file) => file.size <= MAX_EXCEL_SIZE_BYTES,
      `El archivo supera ${MAX_EXCEL_SIZE_MB}MB.`,
    )
    .refine(
      (file) => file.name.toLowerCase().endsWith(".xlsx"),
      "El archivo debe ser .xlsx",
    ),
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

export type CardExcelImportInput = z.infer<typeof CardExcelImportSchema>;
