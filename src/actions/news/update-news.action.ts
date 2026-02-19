"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UpdateNewsSchema, type UpdateNewsInput } from "@/schemas";

export async function updateNewsAction(input: UpdateNewsInput) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "news") {
      throw new Error("No autorizado");
    }

    const data = UpdateNewsSchema.parse(input);
    const publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;

    await prisma.new.update({
      where: { id: data.newsId },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        shortSummary: data.shortSummary,
        content: data.content,
        featuredImage: data.featuredImage,
        publishedAt,
        status: data.status,
        tags: data.tags,
        newCategoryId: data.newCategoryId,
      },
    });

    return true;
  } catch (error) {
    console.error("[updateNewsAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error actualizando noticia",
    );
  }
}
