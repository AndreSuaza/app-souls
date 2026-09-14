"use server";

import { prisma } from "@/lib/prisma";
import type {
  EventStoreSummary,
  PublicEventDetail,
  PublicEventListItem,
} from "@/interfaces/events.interface";
import { EventSlugSchema } from "@/schemas/events/event.schema";
import { resolveEventStores } from "./event-store-utils";
import { resolveEventImageUrl } from "@/utils/event-image";

type PublicEventDetailResult = {
  event: PublicEventDetail;
  recommended: PublicEventListItem[];
};

const mapListItem = (event: {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  shortSummary: string;
  cardImage: string;
  startsAt: Date;
  endsAt: Date | null;
  badgeLabel: string | null;
  stores?: EventStoreSummary[];
}): PublicEventListItem => {
  const stores = event.stores ?? [];
  const storeCities = Array.from(
    new Set(stores.map((store) => store.city).filter(Boolean)),
  );

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    subtitle: event.subtitle,
    shortSummary: event.shortSummary,
    cardImage: resolveEventImageUrl(event.cardImage, "cards"),
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt ? event.endsAt.toISOString() : null,
    badgeLabel: event.badgeLabel,
    storeCity: stores.length > 1 ? "Varias sedes" : (stores[0]?.city ?? null),
    storeCities,
    stores,
  };
};

export async function getPublicEventDetailAction(
  slug: string,
): Promise<PublicEventDetailResult | null> {
  try {
    const eventSlugResult = EventSlugSchema.safeParse(slug);

    if (!eventSlugResult.success) {
      return null;
    }

    const eventSlug = eventSlugResult.data;

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
      },
    });

    if (!event || event.status !== "published") {
      return null;
    }

    const eventStores = await resolveEventStores({
      storeIds: event.storeIds,
      storeId: event.storeId,
    });

    const recommended = await prisma.event.findMany({
      where: {
        id: { not: event.id },
        status: "published",
        startsAt: { gte: new Date() },
      },
      orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
      take: 4,
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        shortSummary: true,
        cardImage: true,
        startsAt: true,
        endsAt: true,
        badgeLabel: true,
        storeId: true,
        storeIds: true,
      },
    });

    const recommendedWithStores = await Promise.all(
      recommended.map(async (item) => ({
        ...item,
        stores: await resolveEventStores({
          storeIds: item.storeIds,
          storeId: item.storeId,
        }),
      })),
    );

    return {
      event: {
        ...mapListItem({ ...event, stores: eventStores }),
        content: event.content,
        featuredImage: resolveEventImageUrl(event.featuredImage, "banners"),
        store: eventStores.length === 1 ? eventStores[0] : null,
      },
      recommended: recommendedWithStores.map(mapListItem),
    };
  } catch (error) {
    console.error("[getPublicEventDetailAction]", error);
    throw new Error("Error cargando detalle del evento");
  }
}
