"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { resolveNewsStatus } from "@/logic";
import { CreateNewsSchema, type CreateNewsInput } from "@/schemas";
import { buildNewsSlug } from "@/utils/news-slug";

export async function createNewsAction(input: CreateNewsInput) {
  try {
    const session = await auth();

    if (!session?.user?.idd) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "news") {
      throw new Error("No autorizado");
    }

    const data = CreateNewsSchema.parse(input);
    const slug = buildNewsSlug(data.title);

    if (!slug) {
      throw new Error("El título no es válido");
    }

    const existingSlug = await prisma.new.findFirst({
      where: {
        slug,
        status: { not: "deleted" },
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

    const created = await prisma.new.create({
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
        userId: session.user.idd,
        newCategoryId: data.newCategoryId,
      },
      select: { id: true, slug: true },
    });

    return created.slug;
  } catch (error) {
    console.error("[createNewsAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error creando noticia",
    );
  }
}
