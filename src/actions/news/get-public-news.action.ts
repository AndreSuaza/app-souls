"use server";

import { prisma } from "@/lib/prisma";
import type { PublicNewsListItem } from "@/interfaces";

export async function getPublicNewsAction(): Promise<PublicNewsListItem[]> {
  try {
    const news = await prisma.new.findMany({
      where: {
        status: "published",
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
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
      title: item.title,
      subtitle: item.subtitle,
      shortSummary: item.shortSummary,
      cardImage: item.cardImage,
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
