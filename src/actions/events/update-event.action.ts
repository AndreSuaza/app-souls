"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UpdateEventSchema, type UpdateEventInput } from "@/schemas";

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

    const startsAt = parseEventDate(data.startsAt, "La fecha de inicio");
    const endsAt = data.endsAt
      ? parseEventDate(data.endsAt, "La fecha de cierre")
      : null;

    const selectedStoreIds = data.storeIds;

    if (selectedStoreIds.length > 0) {
      const stores = await prisma.store.findMany({
        where: { id: { in: selectedStoreIds } },
        select: { id: true, name: true },
      });

      if (stores.length !== selectedStoreIds.length) {
        throw new Error("Una o más tiendas seleccionadas no existen");
      }
    }

    await prisma.event.update({
      where: { id: data.eventId },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        shortSummary: data.shortSummary,
        content: data.content,
        featuredImage: data.featuredImage,
        cardImage: data.cardImage,
        startsAt,
        endsAt,
        status: data.status,
        badgeLabel: data.badgeLabel?.trim() || null,
        storeId: selectedStoreIds[0] ?? null,
        storeIds: selectedStoreIds,
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
