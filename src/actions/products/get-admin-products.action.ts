"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { AdminProductListItem } from "@/interfaces";

export async function getAdminProductsAction(): Promise<
  AdminProductListItem[]
> {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin") {
      return [];
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [{ status: "active" }, { status: { isSet: false } }],
      },
      orderBy: [{ index: "desc" }, { createDate: "desc" }],
      select: {
        id: true,
        name: true,
        code: true,
        releaseDate: true,
        index: true,
        show: true,
        ProductImage: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      code: product.code,
      releaseDate: product.releaseDate,
      index: product.index,
      show: product.show,
      imageUrl: product.ProductImage[0]?.url ?? product.code ?? null,
    }));
  } catch (error) {
    console.error("[getAdminProductsAction]", error);
    throw new Error("Error cargando productos");
  }
}
