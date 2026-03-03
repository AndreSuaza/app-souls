"use server";

import { prisma } from "@/lib/prisma";
import type { PublicNewsCard, PublicNewsDetail } from "@/interfaces";
import { z } from "zod";

const NewsSlugSchema = z.string().min(1);

type PublicNewsDetailResponse = {
  news: PublicNewsDetail;
  recommended: PublicNewsCard[];
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
        newCategory: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!news || news.status !== "published") {
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
      newCategory: {
        select: {
          name: true,
        },
      },
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

    const mapCard = (
      item: typeof sameCategoryNews[number],
    ): PublicNewsCard => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      shortSummary: item.shortSummary,
      featuredImage: item.featuredImage,
      cardImage: item.cardImage,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      newCategoryId: item.newCategoryId,
      categoryName: item.newCategory?.name ?? null,
    });

    return {
      news: {
        id: news.id,
        slug: news.slug,
        title: news.title,
        subtitle: news.subtitle,
        shortSummary: news.shortSummary,
        content: news.content,
        featuredImage: news.featuredImage,
        cardImage: news.cardImage,
        publishedAt: news.publishedAt ? news.publishedAt.toISOString() : null,
        newCategoryId: news.newCategoryId,
        categoryName: news.newCategory?.name ?? null,
      },
      // Prioriza noticias de la misma categoría y completa con las más recientes.
      recommended: [...sameCategoryNews, ...fallbackNews].map(mapCard),
    };
  } catch (error) {
    console.error("[getPublicNewsDetailAction]", error);
    throw new Error("Error cargando noticia pública");
  }
}
