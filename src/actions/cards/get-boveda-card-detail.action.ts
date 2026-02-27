"use server";

import { prisma } from "@/lib/prisma";
import { CardIdSchema, type CardIdInput } from "@/schemas";

export async function getBovedaCardDetailAction(input: CardIdInput) {
  const { cardId } = CardIdSchema.parse(input);

  const card = await prisma.card.findUnique({
    where: {
      id: cardId,
    },
    select: {
      id: true,
      idd: true,
      code: true,
      name: true,
      cost: true,
      force: true,
      defense: true,
      limit: true,
      effect: true,
      price: true,
      product: {
        select: {
          name: true,
          code: true,
          show: true,
          url: true,
        },
      },
      types: {
        select: {
          name: true,
        },
      },
      archetypes: {
        select: {
          name: true,
        },
      },
      rarities: {
        select: {
          name: true,
        },
      },
      keywords: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!card) return null;

  const relatedProducts = await prisma.card.findMany({
    where: {
      idd: card.idd,
    },
    select: {
      product: {
        select: {
          name: true,
          code: true,
          show: true,
          url: true,
        },
      },
    },
  });

  // Prioriza el producto principal y elimina duplicados por codigo.
  const uniqueProducts = new Map(
    relatedProducts.map((item) => [item.product.code, item.product]),
  );
  uniqueProducts.set(card.product.code, card.product);

  return {
    ...card,
    relatedProducts: Array.from(uniqueProducts.values()),
  };
}
