"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UpdateEventSchema, type UpdateEventInput } from "@/schemas";
import {
  buildEventCompositeSlug,
  EVENT_SLUG_MAX_LENGTH,
} from "@/utils/event-slug";

const parseEventDate = (value: string | Date, fieldLabel: string) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldLabel} no es valida`);
  }
  return date;
};

const withSlugSuffix = (baseSlug: string, suffix: number) => {
  const suffixText = `-${suffix}`;
  const trimmedBase = baseSlug
    .slice(0, EVENT_SLUG_MAX_LENGTH - suffixText.length)
    .replace(/-+$/g, "");
  return `${trimmedBase}${suffixText}`;
};

const resolveUniqueEventSlug = async (baseSlug: string, eventId: string) => {
  let slug = baseSlug;
  let suffix = 2;

  while (
    await prisma.event.findFirst({
      where: {
        slug,
        status: { not: "deleted" },
        id: { not: eventId },
      },
      select: { id: true },
    })
  ) {
    slug = withSlugSuffix(baseSlug, suffix);
    suffix += 1;
  }

  return slug;
};

export async function updateEventAction(input: UpdateEventInput) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const data = UpdateEventSchema.parse(input);

    if (data.status === "deleted") {
      throw new Error("Usa eliminar para borrar un evento");
    }

    const existing = await prisma.event.findUnique({
      where: { id: data.eventId },
      select: { id: true, status: true },
    });

    if (!existing || existing.status === "deleted") {
      throw new Error("Evento no encontrado");
    }

    const startsAt = parseEventDate(data.startsAt, "La fecha de inicio");
    const endsAt = data.endsAt
      ? parseEventDate(data.endsAt, "La fecha de cierre")
      : null;

    let storeName: string | null = null;
    if (data.storeId) {
      const store = await prisma.store.findUnique({
        where: { id: data.storeId },
        select: { id: true, name: true },
      });

      if (!store) {
        throw new Error("La tienda seleccionada no existe");
      }
      storeName = store.name;
    }

    const baseSlug = buildEventCompositeSlug({
      title: data.title,
      storeName,
      startsAt: data.startsAt,
    });

    if (!baseSlug) {
      throw new Error("El titulo no es valido");
    }

    const slug = await resolveUniqueEventSlug(baseSlug, data.eventId);

    await prisma.event.update({
      where: { id: data.eventId },
      data: {
        title: data.title,
        slug,
        subtitle: data.subtitle,
        shortSummary: data.shortSummary,
        content: data.content,
        featuredImage: data.featuredImage,
        cardImage: data.cardImage,
        startsAt,
        endsAt,
        status: data.status,
        badgeLabel: data.badgeLabel?.trim() || null,
        storeId: data.storeId || null,
      },
    });

    return true;
  } catch (error) {
    console.error("[updateEventAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error actualizando evento",
    );
  }
}
