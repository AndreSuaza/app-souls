"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const CardFiltersSchema = z
  .object({
    text: z.string().trim().min(1).optional(),
    products: z.string().optional(),
    types: z.string().optional(),
    archetypes: z.string().optional(),
    keywords: z.string().optional(),
    costs: z.string().optional(),
    forces: z.string().optional(),
    defenses: z.string().optional(),
    rarities: z.string().optional(),
    limit: z.string().optional(),
  })
  .strict();

type CardFiltersInput = z.infer<typeof CardFiltersSchema>;

interface WhereClause {
  product?: { code: { in: string[] } };
  typeIds?: { hasEvery: string[] };
  archetypesIds?: { hasEvery: string[] };
  keywordsIds?: { hasEvery: string[] };
  cost?: { in: number[] };
  force?: { in: string[] };
  defense?: { in: string[] };
  raritiesIds?: { hasEvery: string[] };
  limit?: { in: string[] };
  OR?: Array<{
    effect?: { contains: string; mode: "insensitive" };
    idd?: { equals: string; mode: "insensitive" };
    name?: { contains: string; mode: "insensitive" };
  }>;
}

export const getCardsByFiltersAction = async (input: CardFiltersInput = {}) => {
  const {
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
  } = CardFiltersSchema.parse(input);

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

      return where;
    };

    // Se trae la lista completa para agregar todas las cartas filtradas al mazo admin.
    const cards = await prisma.card.findMany({
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
      orderBy: [{ id: "desc" }],
    });

    return cards.map((card) => ({
      ...card,
      price: card.price ?? null,
    }));
  } catch (error) {
    throw new Error(`No se pudo cargar las cartas ${error}`);
  }
};
