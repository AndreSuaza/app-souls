"use server";

import { auth } from "@/auth";
import type { AdminEventListItem } from "@/interfaces/events.interface";
import { prisma } from "@/lib/prisma";

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
        store: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    });

    return events.map((event) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      subtitle: event.subtitle,
      status: event.status,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt ? event.endsAt.toISOString() : null,
      badgeLabel: event.badgeLabel,
      storeId: event.storeId,
      storeName: event.store?.name ?? null,
      createdAt: event.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("[getAdminEventsAction]", error);
    throw new Error("Error cargando eventos");
  }
}
