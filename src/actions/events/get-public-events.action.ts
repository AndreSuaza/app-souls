"use server";

import { prisma } from "@/lib/prisma";
import type { PublicEventListItem } from "@/interfaces/events.interface";
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
      },
    });

    return events.map((event) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      subtitle: event.subtitle,
      shortSummary: event.shortSummary,
      cardImage: resolveEventImageUrl(event.cardImage, "cards"),
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt ? event.endsAt.toISOString() : null,
      badgeLabel: event.badgeLabel,
    }));
  } catch (error) {
    console.error("[getPublicEventsAction]", error);
    throw new Error("Error cargando eventos publicos");
  }
}
