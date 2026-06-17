"use server";

import { prisma } from "@/lib/prisma";
import type { PublicNewsListItem } from "@/interfaces";
import { resolveNewsImageUrl } from "@/utils/news-image";

const getCategoryNamesById = async (categoryIds: string[]) => {
  const uniqueCategoryIds = Array.from(new Set(categoryIds));

  if (uniqueCategoryIds.length === 0) {
    return new Map<string, string>();
  }

  const categories = await prisma.newCategory.findMany({
    where: {
      id: { in: uniqueCategoryIds },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return new Map(categories.map((category) => [category.id, category.name]));
};

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
      },
    });
    const categoryNames = await getCategoryNamesById(
      news.map((item) => item.newCategoryId),
    );

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
      categoryName: categoryNames.get(item.newCategoryId) ?? null,
      createdAt: item.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("[getPublicNewsAction]", error);
    throw new Error("Error cargando noticias públicas");
  }
}
