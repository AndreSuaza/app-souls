"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateNewsSchema, type CreateNewsInput } from "@/schemas";

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
    const publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;

    const created = await prisma.new.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        shortSummary: data.shortSummary,
        content: data.content,
        featuredImage: data.featuredImage,
        publishedAt,
        status: data.status,
        tags: data.tags,
        userId: session.user.idd,
        newCategoryId: data.newCategoryId,
      },
      select: { id: true },
    });

    return created.id;
  } catch (error) {
    console.error("[createNewsAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error creando noticia",
    );
  }
}
