"use server";

import { prisma } from "@/lib/prisma";

export const getProductUrl = async (url: string) => {
  try {
    const product = await prisma.product.findFirst({
      include: {
        ProductImage: {
          select: {
            id: true,
            url: true,
            alt: true,
          },
        },
        deck: {
          select: {
            cards: true,
          },
        },
      },
      where: {
        url: url,
        OR: [{ status: "active" }, { status: { isSet: false } }],
      },
    });

    if (!product) return null;

    return {
      ...product,
      images: product.ProductImage.map((image) => image.url),
      deckCards: product.deck?.cards ?? "",
    };
  } catch (error) {
    throw new Error(`No se pudo cargar el producto  ${error}`);
  }
};
