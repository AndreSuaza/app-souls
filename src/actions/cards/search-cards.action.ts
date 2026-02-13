"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CardSearchSchema, type CardSearchInput } from "@/schemas";

export async function searchCardsAction(input: CardSearchInput = {}) {
  const { text, take = 30, page = 1 } = CardSearchSchema.parse(input);
  const currentPage = Math.max(1, page);

  const where: Prisma.CardWhereInput = text
    ? {
        OR: [
          {
            effect: {
              contains: text,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            idd: {
              equals: text,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            name: {
              contains: text,
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
    },
  });

  return {
    cards,
    totalCount,
    totalPages,
    currentPage: safePage,
    perPage: take,
  };
}
