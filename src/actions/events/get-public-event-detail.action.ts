"use server";

import { prisma } from "@/lib/prisma";
import type { PublicEventDetail, PublicEventListItem } from "@/interfaces/events.interface";
import { EventSlugSchema } from "@/schemas/events/event.schema";
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
}): PublicEventListItem => ({
  id: event.id,
  slug: event.slug,
  title: event.title,
  subtitle: event.subtitle,
  shortSummary: event.shortSummary,
  cardImage: resolveEventImageUrl(event.cardImage, "cards"),
  startsAt: event.startsAt.toISOString(),
  endsAt: event.endsAt ? event.endsAt.toISOString() : null,
  badgeLabel: event.badgeLabel,
});

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
      },
    });

    if (!event || event.status !== "published") {
      return null;
    }

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
      },
    });

    return {
      event: {
        ...mapListItem(event),
        content: event.content,
        featuredImage: resolveEventImageUrl(event.featuredImage, "banners"),
      },
      recommended: recommended.map(mapListItem),
    };
  } catch (error) {
    console.error("[getPublicEventDetailAction]", error);
    throw new Error("Error cargando detalle del evento");
  }
}
