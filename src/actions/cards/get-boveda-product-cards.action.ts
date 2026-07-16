"use server";

import { prisma } from "@/lib/prisma";
import {
  BovedaProductCardsSchema,
  type BovedaProductCardsInput,
} from "@/schemas";
import { activeCardWhere } from "./card-status";

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
      status: true,
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

  if (!card || card.status === "deleted") {
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
        AND: [activeCardWhere(), { productId: card.productId }],
      },
      select: {
        id: true,
        idd: true,
        code: true,
        name: true,
        slug: true,
        imageUrl: true,
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
        AND: [activeCardWhere(), { productId: card.productId }],
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
