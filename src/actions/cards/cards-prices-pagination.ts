"use server";

import { prisma } from "@/lib/prisma";

interface WhereClause {
  product?: { code: { in: string[] } };
  raritiesIds?: { hasEvery: string[] };
  OR?: Array<{
    effect?: { contains: string; mode: "insensitive" };
    idd?: { equals: string; mode: "insensitive" };
    name?: { contains: string; mode: "insensitive" };
  }>;
}

interface PaginationOptions {
  page?: number;
  take?: number;
  products?: string;
  rarities?: string;
  text?: string;
}

export const getPaginatedPricesCards = async ({
  page = 1,
  take = 25,
  products,
  rarities,
  text,
}: PaginationOptions) => {
  if (isNaN(Number(page))) page = 1;
  if (page < 1) page = 1;

  try {
    const whereConstruction = () => {
      const where: WhereClause = {};
      if (products) {
        where.product = {
          code: {
            in: products.split(",").map((item) => item.trim()),
          },
        };
      }
      if (rarities) {
        where.raritiesIds = {
          hasEvery: rarities.split(",").map((item) => item.trim()),
        };
      }
      if (text) {
        where.OR = [
          { effect: { contains: text, mode: "insensitive" } },
          { idd: { equals: text, mode: "insensitive" } },
          { name: { contains: text, mode: "insensitive" } },
        ];
      }
      return where;
    };

    const cards = await prisma.card.findMany({
      take: take,
      skip: (page - 1) * take,
      include: {
        product: {
          select: {
            name: true,
            code: true,
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
      cards: cards,
    };
  } catch (error) {
    throw new Error(`No se pudo cargar las cartas ${error}`);
  }
};
