"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { NewsCategoryOption } from "@/interfaces";

export async function getNewsCategoriesAction(): Promise<NewsCategoryOption[]> {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "news") {
      return [];
    }

    const categories = await prisma.newCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    return categories;
  } catch (error) {
    console.error("[getNewsCategoriesAction]", error);
    throw new Error("Error cargando categorías");
  }
}
