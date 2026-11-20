import { z } from "zod";

export const ADMIN_CARD_EXPORT_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "idd", label: "Numeración" },
  { key: "code", label: "Código" },
  { key: "name", label: "Nombre" },
  { key: "product", label: "Producto" },
  { key: "productCode", label: "Código de producto" },
  { key: "limit", label: "Límite" },
  { key: "rotation", label: "Rotación" },
  { key: "cost", label: "Coste" },
  { key: "force", label: "Fuerza" },
  { key: "defense", label: "Defensa" },
  { key: "effect", label: "Efecto" },
  { key: "price", label: "Precio" },
  { key: "status", label: "Estado" },
  { key: "access", label: "Acceso" },
  { key: "baseCardId", label: "ID de carta base" },
  { key: "imageUrl", label: "URL de imagen" },
  { key: "types", label: "Tipos" },
  { key: "archetypes", label: "Arquetipos" },
  { key: "keywords", label: "Keywords" },
  { key: "rarities", label: "Rarezas" },
  { key: "createDate", label: "Fecha de creación" },
] as const;

export const ADMIN_CARD_EXPORT_COLUMN_KEYS = ADMIN_CARD_EXPORT_COLUMNS.map(
  ({ key }) => key,
) as [string, ...string[]];

const AdminCardExportColumnSchema = z.enum(ADMIN_CARD_EXPORT_COLUMN_KEYS);

export const AdminCardExportSchema = z
  .object({
    scope: z.enum(["allActive", "products"]),
    productIds: z.array(z.string().trim().min(1)).max(100).default([]),
    columns: z
      .array(AdminCardExportColumnSchema)
      .min(1)
      .refine((columns) => new Set(columns).size === columns.length, {
        message: "Las columnas no pueden repetirse.",
      }),
    format: z.enum(["json", "csv", "txt", "xlsx"]),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.scope === "products" && value.productIds.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["productIds"],
        message: "Selecciona al menos un producto.",
      });
    }
  });

export type AdminCardExportInput = z.infer<typeof AdminCardExportSchema>;
export type AdminCardExportColumnKey = (typeof ADMIN_CARD_EXPORT_COLUMNS)[number]["key"];
