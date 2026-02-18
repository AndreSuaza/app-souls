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
        },
      },
    },
  });

  const uniqueProducts = new Map(
    cards.map((item) => [item.product.code, item.product]),
  );

  return {
    products: Array.from(uniqueProducts.values()),
  };
}
