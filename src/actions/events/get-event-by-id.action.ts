"use server";

import { auth } from "@/auth";
import type { EventDetail } from "@/interfaces/events.interface";
import { prisma } from "@/lib/prisma";
import { EventSlugSchema } from "@/schemas/events/event.schema";
import { resolveEventStores } from "./event-store-utils";

export async function getEventByIdAction(
  slug: string,
): Promise<EventDetail | null> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const eventSlug = EventSlugSchema.parse(slug);

    const event = await prisma.event.findUnique({
      where: { slug: eventSlug },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        shortSummary: true,
        content: true,
        featuredImage: true,
        cardImage: true,
        startsAt: true,
        endsAt: true,
        status: true,
        badgeLabel: true,
        storeId: true,
        storeIds: true,
        createdAt: true,
      },
    });

    if (!event || event.status === "deleted") {
      return null;
    }

    const stores = await resolveEventStores({
      storeIds: event.storeIds,
      storeId: event.storeId,
    });

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      subtitle: event.subtitle,
      shortSummary: event.shortSummary,
      content: event.content,
      featuredImage: event.featuredImage,
      cardImage: event.cardImage,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt ? event.endsAt.toISOString() : null,
      status: event.status,
      badgeLabel: event.badgeLabel,
      storeId: stores[0]?.id ?? event.storeId,
      storeIds: stores.map((store) => store.id),
      storeName:
        stores.length === 1
          ? stores[0].name
          : stores.length > 1
            ? `${stores.length} tiendas`
            : null,
      stores,
      createdAt: event.createdAt.toISOString(),
    };
  } catch (error) {
    console.error("[getEventByIdAction]", error);
    throw new Error("Error cargando evento");
  }
}
