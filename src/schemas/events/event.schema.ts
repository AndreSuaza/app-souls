import { z } from "zod";

export const EventSlugSchema = z
  .string()
  .trim()
  .min(1, "El slug del evento es obligatorio")
  .max(180, "El slug del evento no puede superar los 180 caracteres");

const BaseEventObjectSchema = z.object({
  title: z
    .string()
    .min(3, "El titulo debe tener al menos 3 caracteres")
    .max(120, "El titulo no puede superar los 120 caracteres"),
  subtitle: z
    .string()
    .min(3, "El subtitulo debe tener al menos 3 caracteres")
    .max(160, "El subtitulo no puede superar los 160 caracteres"),
  shortSummary: z
    .string()
    .min(10, "El resumen debe tener al menos 10 caracteres")
    .max(300, "El resumen no puede superar los 300 caracteres"),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres"),
  featuredImage: z.string().min(1, "La imagen destacada es obligatoria"),
  cardImage: z.string().min(1, "La imagen para tarjeta es obligatoria"),
  startsAt: z.string().or(z.date()),
  endsAt: z.string().or(z.date()).optional().nullable(),
  status: z
    .enum(["draft", "scheduled", "published", "deleted"])
    .default("draft"),
  badgeLabel: z.string().max(40).optional().nullable(),
  storeId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "La tienda seleccionada no es válida")
    .optional()
    .nullable(),
});

const validateEventDates = (data: {
  startsAt: string | Date;
  endsAt?: string | Date | null;
}) => {
  if (!data.endsAt) return true;
  const startsAt = new Date(data.startsAt);
  const endsAt = new Date(data.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return false;
  }
  return endsAt > startsAt;
};

const eventDateRefinement = {
  message: "La fecha de cierre debe ser posterior al inicio",
  path: ["endsAt"],
};

export const CreateEventSchema = BaseEventObjectSchema.refine(
  validateEventDates,
  eventDateRefinement,
);

export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const UpdateEventSchema = BaseEventObjectSchema.extend({
  eventId: z.string().min(1, "El evento es obligatorio"),
}).refine(
  (data) => {
    return validateEventDates(data);
  },
  eventDateRefinement,
);

export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
