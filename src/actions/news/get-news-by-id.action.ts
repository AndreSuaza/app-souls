"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { NewsDetail } from "@/interfaces";
import { z } from "zod";

const NewsSlugSchema = z.string().min(1);

export async function getNewsByIdAction(
  slug: string,
): Promise<NewsDetail | null> {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "news") {
      return null;
    }

    const newsSlug = NewsSlugSchema.parse(slug);

    const news = await prisma.new.findUnique({
      where: { slug: newsSlug },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        shortSummary: true,
        content: true,
        featuredImage: true,
        cardImage: true,
        publishedAt: true,
        status: true,
        tags: true,
        userId: true,
        newCategoryId: true,
        user: {
          select: {
            name: true,
            lastname: true,
            nickname: true,
          },
        },
      },
    });

    if (!news || news.status === "deleted") {
      return null;
    }

    return {
      id: news.id,
      slug: news.slug,
      title: news.title,
      subtitle: news.subtitle,
      shortSummary: news.shortSummary,
      content: news.content,
      featuredImage: news.featuredImage,
      cardImage: news.cardImage,
      publishedAt: news.publishedAt ? news.publishedAt.toISOString() : null,
      status: news.status,
      tags: news.tags ?? [],
      userId: news.userId,
      newCategoryId: news.newCategoryId,
      // Prioriza nombre completo y cae al nickname para mostrar un autor legible.
      authorName: news.user
        ? `${news.user.name ?? ""} ${news.user.lastname ?? ""}`.trim() ||
          news.user.nickname
        : null,
    };
  } catch (error) {
    console.error("[getNewsByIdAction]", error);
    throw new Error("Error cargando noticia");
  }
}
