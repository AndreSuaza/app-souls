"use server";

import { prisma } from "@/lib/prisma";
import type { AdminNewsListItem } from "@/interfaces";

export async function getPublicNewsAction(): Promise<AdminNewsListItem[]> {
  try {
    const news = await prisma.new.findMany({
      where: {
        status: "published",
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        status: true,
        publishedAt: true,
        userId: true,
        newCategoryId: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            lastname: true,
            nickname: true,
          },
        },
        newCategory: {
          select: {
            name: true,
          },
        },
      },
    });

    return news.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      status: item.status,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      userId: item.userId,
      newCategoryId: item.newCategoryId,
      // Exponemos autor para reutilizar el layout administrativo en la vista pública temporal.
      authorName: item.user
        ? `${item.user.name ?? ""} ${item.user.lastname ?? ""}`.trim() ||
          item.user.nickname
        : null,
      categoryName: item.newCategory?.name ?? null,
      createdAt: item.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("[getPublicNewsAction]", error);
    throw new Error("Error cargando noticias públicas");
  }
}
