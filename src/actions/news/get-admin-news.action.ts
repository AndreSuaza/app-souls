"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { AdminNewsListItem } from "@/interfaces";

const getCategoryNamesById = async (categoryIds: string[]) => {
  const uniqueCategoryIds = Array.from(new Set(categoryIds));

  if (uniqueCategoryIds.length === 0) {
    return new Map<string, string>();
  }

  const categories = await prisma.newCategory.findMany({
    where: {
      id: { in: uniqueCategoryIds },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return new Map(categories.map((category) => [category.id, category.name]));
};

export async function getAdminNewsAction(): Promise<AdminNewsListItem[]> {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "news") {
      return [];
    }

    const news = await prisma.new.findMany({
      where: {
        status: { not: "deleted" },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
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
      },
    });
    const categoryNames = await getCategoryNamesById(
      news.map((item) => item.newCategoryId),
    );

    return news.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      subtitle: item.subtitle,
      status: item.status,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
      userId: item.userId,
      newCategoryId: item.newCategoryId,
      // Prioriza nombre completo y cae al nickname para mostrar un autor legible.
      authorName: item.user
        ? `${item.user.name ?? ""} ${item.user.lastname ?? ""}`.trim() ||
          item.user.nickname
        : null,
      categoryName: categoryNames.get(item.newCategoryId) ?? null,
      createdAt: item.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("[getAdminNewsAction]", error);
    throw new Error("Error cargando noticias");
  }
}
