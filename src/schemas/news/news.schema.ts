import { z } from "zod";

export const NewsStatusEnum = z.enum(["draft", "scheduled", "published"]);

const TagsSchema = z.array(z.string().trim().min(1)).default([]);

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
  status: NewsStatusEnum,
  publishedAt: z.string().or(z.date()).optional(),
});

const validatePublishedAt = (
  data: z.infer<typeof BaseNewsSchema>,
  ctx: z.RefinementCtx,
) => {
  if (data.status === "draft") return;

  if (!data.publishedAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["publishedAt"],
      message: "La fecha de publicación es obligatoria",
    });
  }
};

export const CreateNewsSchema = BaseNewsSchema.superRefine(validatePublishedAt);

export type CreateNewsInput = z.infer<typeof CreateNewsSchema>;

export const UpdateNewsSchema = BaseNewsSchema.extend({
  newsId: z.string().min(1),
}).superRefine((data, ctx) => {
  validatePublishedAt(data, ctx);
});

export type UpdateNewsInput = z.infer<typeof UpdateNewsSchema>;
