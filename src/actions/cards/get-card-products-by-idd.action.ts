"use server";

import { prisma } from "@/lib/prisma";
import { CardIdSchema, type CardIdInput } from "@/schemas";

export async function getCardProductsByIddAction(input: CardIdInput) {
  const { cardId } = CardIdSchema.parse(input);

  const card = await prisma.card.findFirst({
    where: {
      OR: [{ id: cardId }, { idd: cardId }],
    },
    select: {
      idd: true,
      product: {
        select: {
          code: true,
          name: true,
          show: true,
          url: true,
          status: true,
        },
      },
    },
  });

  if (!card) {
    return { products: [] };
  }

  const cards = await prisma.card.findMany({
    where: {
      idd: card.idd,
    },
    select: {
      product: {
        select: {
          code: true,
          name: true,
          show: true,
          url: true,
          status: true,
        },
      },
    },
  });

  const uniqueProducts = new Map(
    cards
      .map((item) => item.product)
      .filter((product) => product.show && product.status !== "deleted")
      .map((product) => [product.code, product]),
  );

  return {
    products: Array.from(uniqueProducts.values()),
  };
}
