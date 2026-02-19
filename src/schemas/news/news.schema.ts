import { z } from "zod";

const TagsSchema = z
  .array(z.string().trim().min(1))
  .max(5, "Solo se permiten 5 etiquetas")
  .default([]);

const BaseNewsSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(120, "El título no puede superar los 120 caracteres"),
  subtitle: z
    .string()
    .min(3, "El subtítulo debe tener al menos 3 caracteres")
    .max(160, "El subtítulo no puede superar los 160 caracteres"),
  shortSummary: z
    .string()
    .min(10, "El resumen debe tener al menos 10 caracteres")
    .max(300, "El resumen no puede superar los 300 caracteres"),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres"),
  featuredImage: z.string().min(1, "La imagen destacada es obligatoria"),
  newCategoryId: z.string().min(1, "La categoría es obligatoria"),
  tags: TagsSchema,
  publishedAt: z.string().or(z.date()).optional(),
  publishNow: z.boolean().optional().default(false),
});

export const CreateNewsSchema = BaseNewsSchema;

export type CreateNewsInput = z.infer<typeof CreateNewsSchema>;

export const UpdateNewsSchema = BaseNewsSchema.extend({
  newsId: z.string().min(1),
});

export type UpdateNewsInput = z.infer<typeof UpdateNewsSchema>;
