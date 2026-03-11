"use server";

import { prisma } from "@/lib/prisma";
import type { PublicNewsListItem } from "@/interfaces";
import { resolveNewsImageUrl } from "@/utils/news-image";

export async function getPublicNewsAction(): Promise<PublicNewsListItem[]> {
  try {
    const news = await prisma.new.findMany({
      where: {
        status: "published",
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        shortSummary: true,
        cardImage: true,
        publishedAt: true,
        tags: true,
        newCategoryId: true,
        createdAt: true,
        newCategory: {
          select: {
            name: true,
          },
        },
      },
    });

    return news.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle,
      shortSummary: item.shortSummary,
      cardImage: resolveNewsImageUrl(item.cardImage, "cards"),
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      tags: item.tags ?? [],
      newCategoryId: item.newCategoryId,
      categoryName: item.newCategory?.name ?? null,
      createdAt: item.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("[getPublicNewsAction]", error);
    throw new Error("Error cargando noticias públicas");
  }
}
