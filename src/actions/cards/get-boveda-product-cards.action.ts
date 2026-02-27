"use server";

import { prisma } from "@/lib/prisma";
import {
  BovedaProductCardsSchema,
  type BovedaProductCardsInput,
} from "@/schemas";

const PAGE_SIZE = 10;

export async function getBovedaProductCardsAction(
  input: BovedaProductCardsInput,
) {
  const { cardId, page } = BovedaProductCardsSchema.parse(input);

  const card = await prisma.card.findUnique({
    where: {
      id: cardId,
    },
    select: {
      productId: true,
      product: {
        select: {
          name: true,
          code: true,
          url: true,
        },
      },
    },
  });

  if (!card) {
    return {
      product: null,
      cards: [],
      totalCount: 0,
      totalPage: 1,
      perPage: PAGE_SIZE,
      currentPage: page,
    };
  }

  const [cards, totalCount] = await Promise.all([
    prisma.card.findMany({
      where: {
        productId: card.productId,
      },
      select: {
        id: true,
        idd: true,
        code: true,
        name: true,
        price: true,
        rarities: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          idd: "asc",
        },
      ],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.card.count({
      where: {
        productId: card.productId,
      },
    }),
  ]);

  const totalPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return {
    product: card.product,
    cards,
    totalCount,
    totalPage,
    perPage: PAGE_SIZE,
    currentPage: page,
  };
}
