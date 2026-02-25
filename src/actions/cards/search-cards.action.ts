"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CardSearchSchema, type CardSearchInput } from "@/schemas";

export async function searchCardsAction(input: CardSearchInput = {}) {
  const { text, take = 30, page = 1 } = CardSearchSchema.parse(input);
  const currentPage = Math.max(1, page);
  const searchText = text?.trim();
  // Evita errores en Mongo cuando el texto no es un ObjectId válido.
  const isMongoId = searchText
    ? /^[0-9a-fA-F]{24}$/.test(searchText)
    : false;

  const where: Prisma.CardWhereInput = searchText
    ? {
        OR: [
          {
            effect: {
              contains: searchText,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          ...(isMongoId
            ? [
                {
                  id: {
                    equals: searchText,
                  },
                },
              ]
            : []),
          {
            idd: {
              equals: searchText,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            name: {
              contains: searchText,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            code: {
              contains: searchText,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        ],
      }
    : {};

  const totalCount = await prisma.card.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / take));
  const safePage = Math.min(currentPage, totalPages);

  const cards = await prisma.card.findMany({
    where,
    take,
    skip: (safePage - 1) * take,
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      idd: true,
      code: true,
      name: true,
      rarities: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    cards: cards.map((card) => ({
      id: card.id,
      idd: card.idd,
      code: card.code,
      name: card.name,
      rarityName: card.rarities[0]?.name ?? null,
    })),
    totalCount,
    totalPages,
    currentPage: safePage,
    perPage: take,
  };
}
