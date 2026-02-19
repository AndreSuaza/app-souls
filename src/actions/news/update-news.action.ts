"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveNewsStatus } from "@/logic";
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
    const existing = await prisma.new.findUnique({
      where: { id: data.newsId },
      select: { status: true, publishedAt: true },
    });

    if (!existing) {
      throw new Error("Noticia no encontrada");
    }

    if (existing.status === "deleted") {
      throw new Error("No se puede editar una noticia eliminada");
    }

    const parsedPublishedAt = data.publishedAt
      ? new Date(data.publishedAt)
      : null;
    const { status, publishedAt } = resolveNewsStatus({
      publishedAt: parsedPublishedAt,
      publishNow: data.publishNow,
    });

    await prisma.new.update({
      where: { id: data.newsId },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        shortSummary: data.shortSummary,
        content: data.content,
        featuredImage: data.featuredImage,
        cardImage: data.cardImage,
        publishedAt,
        status,
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
