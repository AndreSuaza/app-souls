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

    const news = await prisma.new.findUnique({
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
        user: {
          select: {
            name: true,
            lastname: true,
            nickname: true,
          },
        },
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
