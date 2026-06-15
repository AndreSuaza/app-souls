"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateEventSchema, type CreateEventInput } from "@/schemas";
import { buildEventSlug } from "@/utils/event-slug";

const parseEventDate = (value: string | Date, fieldLabel: string) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldLabel} no es valida`);
  }
  return date;
};

export async function createEventAction(input: CreateEventInput) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const data = CreateEventSchema.parse(input);

    if (data.status === "deleted") {
      throw new Error("No se puede crear un evento eliminado");
    }

    const slug = buildEventSlug(data.title);

    if (!slug) {
      throw new Error("El titulo no es valido");
    }

    const existingSlug = await prisma.event.findFirst({
      where: {
        slug,
        status: { not: "deleted" },
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

    if (data.storeId) {
      const store = await prisma.store.findUnique({
        where: { id: data.storeId },
        select: { id: true },
      });

      if (!store) {
        throw new Error("La tienda seleccionada no existe");
      }
    }

    const created = await prisma.event.create({
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
      select: { slug: true },
    });

    return created.slug;
  } catch (error) {
    console.error("[createEventAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error creando evento",
    );
  }
}
