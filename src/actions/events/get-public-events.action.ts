"use server";

import { prisma } from "@/lib/prisma";
import type { PublicEventListItem } from "@/interfaces/events.interface";
import {
  eventStoreSelect,
  normalizeEventStoreIds,
  orderEventStores,
} from "./event-store-utils";
import { resolveEventImageUrl } from "@/utils/event-image";

export async function getPublicEventsAction(): Promise<PublicEventListItem[]> {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "published",
      },
      orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
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

    const storeIds = Array.from(
      new Set(
        events.flatMap((event) =>
          normalizeEventStoreIds({
            storeIds: event.storeIds,
            storeId: event.storeId,
          }),
        ),
      ),
    );
    const stores =
      storeIds.length > 0
        ? await prisma.store.findMany({
            where: { id: { in: storeIds } },
            select: eventStoreSelect,
          })
        : [];

    return events.map((event) => ({
      ...(() => {
        const selectedStoreIds = normalizeEventStoreIds({
          storeIds: event.storeIds,
          storeId: event.storeId,
        });
        const eventStores = orderEventStores(selectedStoreIds, stores);
        const storeCities = Array.from(
          new Set(eventStores.map((store) => store.city).filter(Boolean)),
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
          storeCity:
            eventStores.length > 1
              ? "Varias sedes"
              : (eventStores[0]?.city ?? null),
          storeCities,
          stores: eventStores,
        };
      })(),
    }));
  } catch (error) {
    console.error("[getPublicEventsAction]", error);
    throw new Error("Error cargando eventos publicos");
  }
}
