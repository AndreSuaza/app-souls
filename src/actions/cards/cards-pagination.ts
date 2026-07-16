"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { activeCardWhere } from "./card-status";

interface PaginationOptions {
  page?: number;
  take?: number;
  text?: string;
  products?: string;
  types?: string;
  archetypes?: string;
  keywords?: string;
  costs?: string;
  forces?: string;
  defenses?: string;
  rarities?: string;
  limit?: string;
}

export const getPaginatedCards = async ({
  page = 1,
  take = 24,
  text,
  products,
  types,
  archetypes,
  keywords,
  costs,
  forces,
  defenses,
  rarities,
  limit,
}: PaginationOptions) => {
  if (isNaN(Number(page))) page = 1;
  if (page < 1) page = 1;

  try {
    const whereConstruction = () => {
      const where: Prisma.CardWhereInput = {};
      if (products) {
        where.product = {
          code: {
            in: products.split(",").map((item) => item.trim()),
          },
        };
      }
      if (types) {
        where.typeIds = {
          hasEvery: types.split(",").map((item) => item.trim()),
        };
      }
      if (archetypes) {
        where.archetypesIds = {
          hasEvery: archetypes.split(",").map((item) => item.trim()),
        };
      }
      if (keywords) {
        where.keywordsIds = {
          hasEvery: keywords.split(",").map((item) => item.trim()),
        };
      }
      if (costs) {
        where.cost = {
          in: costs.split(",").map((item) => Number.parseInt(item.trim())),
        };
      }
      if (forces) {
        where.force = { in: forces.split(",").map((item) => item.trim()) };
      }
      if (defenses) {
        where.defense = { in: defenses.split(",").map((item) => item.trim()) };
      }
      if (text) {
        where.OR = [
          { effect: { contains: text, mode: "insensitive" } },
          { idd: { equals: text, mode: "insensitive" } },
          { name: { contains: text, mode: "insensitive" } },
        ];
      }
      if (rarities) {
        where.raritiesIds = {
          hasEvery: rarities.split(",").map((item) => item.trim()),
        };
      }
      if (limit) {
        where.limit = { in: limit.split(",").map((item) => item.trim()) };
      }
      return { AND: [activeCardWhere(), where] };
    };

    const cards = await prisma.card.findMany({
      take: take,
      skip: (page - 1) * take,
      include: {
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
        keywords: {
          select: {
            name: true,
          },
        },
        rarities: {
          select: {
            name: true,
          },
        },
        archetypes: {
          select: {
            name: true,
          },
        },
      },
      where: whereConstruction(),
      orderBy: [
        {
          id: "desc",
        },
      ],
    });

    const totalCount = await prisma.card.count({
      where: whereConstruction(),
    });
    const totalPages = Math.ceil(totalCount / take);

    return {
      currentPage: page,
      totalPage: totalPages,
      totalCount,
      perPage: take,
      cards: cards.map((card) => ({
        ...card,
        price: card.price ?? null,
      })),
    };
  } catch (error) {
    throw new Error(`No se pudo cargar las cartas ${error}`);
  }
};
