"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UpdateEventSchema, type UpdateEventInput } from "@/schemas";
import { buildEventSlug } from "@/utils/event-slug";

const parseEventDate = (value: string | Date, fieldLabel: string) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldLabel} no es valida`);
  }
  return date;
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

    const slug = buildEventSlug(data.title);

    if (!slug) {
      throw new Error("El titulo no es valido");
    }

    const existingSlug = await prisma.event.findFirst({
      where: {
        slug,
        status: { not: "deleted" },
        id: { not: data.eventId },
      },
      select: { id: true },
    });

    if (existingSlug) {
      throw new Error("El titulo ya existe");
    }

    const startsAt = parseEventDate(data.startsAt, "La fecha de inicio");
    const endsAt = data.endsAt
      ? parseEventDate(data.endsAt, "La fecha de cierre")
      : null;

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
