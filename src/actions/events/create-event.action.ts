"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateEventSchema, type CreateEventInput } from "@/schemas";
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

const resolveUniqueEventSlug = async (baseSlug: string) => {
  let slug = baseSlug;
  let suffix = 2;

  while (
    await prisma.event.findFirst({
      where: {
        slug,
        status: { not: "deleted" },
      },
      select: { id: true },
    })
  ) {
    slug = withSlugSuffix(baseSlug, suffix);
    suffix += 1;
  }

  return slug;
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

    const slug = await resolveUniqueEventSlug(baseSlug);

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
