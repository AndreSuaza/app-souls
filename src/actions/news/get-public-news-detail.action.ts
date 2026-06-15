"use server";

import { prisma } from "@/lib/prisma";
import type { PublicNewsCard, PublicNewsDetail } from "@/interfaces";
import { z } from "zod";
import { resolveNewsImageUrl } from "@/utils/news-image";

const NewsSlugSchema = z.string().min(1);

type PublicNewsDetailResponse = {
  news: PublicNewsDetail;
  recommended: PublicNewsCard[];
};

type NewsCardSource = {
  id: string;
  slug: string;
  title: string;
  shortSummary: string;
  featuredImage: string;
  cardImage: string;
  publishedAt: Date | null;
  newCategoryId: string;
};

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

export async function getPublicNewsDetailAction(
  slug: string,
): Promise<PublicNewsDetailResponse | null> {
  try {
    const newsSlug = NewsSlugSchema.parse(slug);

    const news = await prisma.new.findUnique({
      where: { slug: newsSlug },
      select: {
        id: true,
        title: true,
        slug: true,
        subtitle: true,
        shortSummary: true,
        content: true,
        featuredImage: true,
        cardImage: true,
        publishedAt: true,
        status: true,
        newCategoryId: true,
      },
    });

    if (!news || news.status === "deleted" || news.status === "draft") {
      return null;
    }

    const baseSelect = {
      id: true,
      slug: true,
      title: true,
      shortSummary: true,
      featuredImage: true,
      cardImage: true,
      publishedAt: true,
      newCategoryId: true,
    };

    const sameCategoryNews = await prisma.new.findMany({
      where: {
        status: "published",
        id: { not: news.id },
        newCategoryId: news.newCategoryId,
      },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: baseSelect,
    });

    const remaining = Math.max(0, 6 - sameCategoryNews.length);
    const fallbackNews =
      remaining > 0
        ? await prisma.new.findMany({
            where: {
              status: "published",
              id: { not: news.id },
              newCategoryId: { not: news.newCategoryId },
            },
            orderBy: { publishedAt: "desc" },
            take: remaining,
            select: baseSelect,
          })
        : [];

    const recommendedNews = [...sameCategoryNews, ...fallbackNews];
    const categoryNames = await getCategoryNamesById([
      news.newCategoryId,
      ...recommendedNews.map((item) => item.newCategoryId),
    ]);

    const mapCard = (item: NewsCardSource): PublicNewsCard => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      shortSummary: item.shortSummary,
      featuredImage: resolveNewsImageUrl(item.featuredImage, "banners"),
      cardImage: resolveNewsImageUrl(item.cardImage, "cards"),
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      newCategoryId: item.newCategoryId,
      categoryName: categoryNames.get(item.newCategoryId) ?? null,
    });

    return {
      news: {
        id: news.id,
        slug: news.slug,
        title: news.title,
        subtitle: news.subtitle,
        shortSummary: news.shortSummary,
        content: news.content,
        featuredImage: resolveNewsImageUrl(news.featuredImage, "banners"),
        cardImage: resolveNewsImageUrl(news.cardImage, "cards"),
        publishedAt: news.publishedAt ? news.publishedAt.toISOString() : null,
        newCategoryId: news.newCategoryId,
        categoryName: categoryNames.get(news.newCategoryId) ?? null,
      },
      // Prioriza noticias de la misma categoría y completa con las más recientes.
      recommended: recommendedNews.map(mapCard),
    };
  } catch (error) {
    console.error("[getPublicNewsDetailAction]", error);
    throw new Error("Error cargando noticia pública");
  }
}
