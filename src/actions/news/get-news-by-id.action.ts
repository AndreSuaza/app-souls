"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { NewsDetail } from "@/interfaces";
import { z } from "zod";

const NewsIdSchema = z.string().min(1);

export async function getNewsByIdAction(
  id: string,
): Promise<NewsDetail | null> {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "news") {
      return null;
    }

    const newsId = NewsIdSchema.parse(id);

    const news = await prisma.news.findUnique({
      where: { id: newsId },
      select: {
        id: true,
        title: true,
        subtitle: true,
        shortSummary: true,
        content: true,
        featuredImage: true,
        publishedAt: true,
        status: true,
        tags: true,
        userId: true,
        newCategoryId: true,
      },
    });

    if (!news) return null;

    return {
      id: news.id,
      title: news.title,
      subtitle: news.subtitle,
      shortSummary: news.shortSummary,
      content: news.content,
      featuredImage: news.featuredImage,
      publishedAt: news.publishedAt ? news.publishedAt.toISOString() : null,
      status: news.status,
      tags: news.tags ?? [],
      userId: news.userId,
      newCategoryId: news.newCategoryId,
    };
  } catch (error) {
    console.error("[getNewsByIdAction]", error);
    throw new Error("Error cargando noticia");
  }
}
