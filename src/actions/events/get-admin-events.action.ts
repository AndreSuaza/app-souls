"use server";

import { auth } from "@/auth";
import type { AdminEventListItem } from "@/interfaces/events.interface";
import { prisma } from "@/lib/prisma";
import {
  eventStoreSelect,
  normalizeEventStoreIds,
  orderEventStores,
} from "./event-store-utils";

export async function getAdminEventsAction(): Promise<AdminEventListItem[]> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const events = await prisma.event.findMany({
      where: {
        status: { not: "deleted" },
      },
      orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        status: true,
        startsAt: true,
        endsAt: true,
        badgeLabel: true,
        storeId: true,
        storeIds: true,
        createdAt: true,
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

        return {
          id: event.id,
          slug: event.slug,
          title: event.title,
          subtitle: event.subtitle,
          status: event.status,
          startsAt: event.startsAt.toISOString(),
          endsAt: event.endsAt ? event.endsAt.toISOString() : null,
          badgeLabel: event.badgeLabel,
          storeId: eventStores[0]?.id ?? event.storeId,
          storeIds: eventStores.map((store) => store.id),
          storeName:
            eventStores.length === 1
              ? eventStores[0].name
              : eventStores.length > 1
                ? `${eventStores.length} tiendas`
                : null,
          stores: eventStores,
          createdAt: event.createdAt.toISOString(),
        };
      })(),
    }));
  } catch (error) {
    console.error("[getAdminEventsAction]", error);
    throw new Error("Error cargando eventos");
  }
}
