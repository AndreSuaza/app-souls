"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveNewsStatus } from "@/logic";
import { UpdateNewsSchema, type UpdateNewsInput } from "@/schemas";
import { buildNewsSlug } from "@/utils/news-slug";
import { deleteBlob } from "@/lib/blob";
import { isBlobValue } from "@/utils/blob-path";

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
      select: {
        status: true,
        publishedAt: true,
        featuredImage: true,
        cardImage: true,
      },
    });

    if (!existing) {
      throw new Error("Noticia no encontrada");
    }

    if (existing.status === "deleted") {
      throw new Error("No se puede editar una noticia eliminada");
    }

    const slug = buildNewsSlug(data.title);

    if (!slug) {
      throw new Error("El título no es válido");
    }

    const existingSlug = await prisma.new.findFirst({
      where: {
        slug,
        status: { not: "deleted" },
        id: { not: data.newsId },
      },
      select: { id: true },
    });

    if (existingSlug) {
      throw new Error("El título ya existe");
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
        slug,
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

    const shouldDeleteFeatured =
      existing.featuredImage &&
      existing.featuredImage !== data.featuredImage &&
      isBlobValue(existing.featuredImage);
    const shouldDeleteCard =
      existing.cardImage &&
      existing.cardImage !== data.cardImage &&
      isBlobValue(existing.cardImage);

    if (shouldDeleteFeatured || shouldDeleteCard) {
      // Limpiamos imágenes anteriores para evitar basura en Blob.
      await Promise.all([
        shouldDeleteFeatured ? deleteBlob(existing.featuredImage) : null,
        shouldDeleteCard ? deleteBlob(existing.cardImage) : null,
      ]);
    }

    return true;
  } catch (error) {
    console.error("[updateNewsAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error actualizando noticia",
    );
  }
}
