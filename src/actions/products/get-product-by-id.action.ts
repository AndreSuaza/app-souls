"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { AdminProductDetail } from "@/interfaces";

export async function getProductByIdAction(
  id: string,
): Promise<AdminProductDetail | null> {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin") {
      return null;
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        releaseDate: true,
        price: true,
        description: true,
        url: true,
        index: true,
        numberCards: true,
        show: true,
        status: true,
        deckId: true,
        deck: {
          select: {
            name: true,
          },
        },
        ProductImage: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
    });

    if (!product || product.status === "deleted") return null;

    return {
      id: product.id,
      name: product.name,
      code: product.code,
      releaseDate: product.releaseDate,
      price: product.price ?? null,
      description: product.description,
      url: product.url,
      index: product.index,
      numberCards: product.numberCards,
      show: product.show,
      deckId: product.deckId ?? null,
      deckName: product.deck?.name ?? null,
      imageUrl: product.ProductImage[0]?.url ?? product.code ?? null,
    };
  } catch (error) {
    console.error("[getProductByIdAction]", error);
    throw new Error("Error cargando producto");
  }
}
