"use server";

import { prisma } from "@/lib/prisma";
import type { NewsCategoryOption } from "@/interfaces";

export async function getPublicNewsCategoriesAction(): Promise<
  NewsCategoryOption[]
> {
  try {
    const categories = await prisma.newCategory.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    return categories;
  } catch (error) {
    console.error("[getPublicNewsCategoriesAction]", error);
    throw new Error("Error cargando categorías públicas");
  }
}
