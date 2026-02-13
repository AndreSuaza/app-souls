"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { AdminNewsListItem } from "@/interfaces";

export async function getAdminNewsAction(): Promise<AdminNewsListItem[]> {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "news") {
      return [];
    }

    const news = await prisma.news.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        status: true,
        publishedAt: true,
        userId: true,
        newCategoryId: true,
        createdAt: true,
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
      createdAt: item.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("[getAdminNewsAction]", error);
    throw new Error("Error cargando noticias");
  }
}
