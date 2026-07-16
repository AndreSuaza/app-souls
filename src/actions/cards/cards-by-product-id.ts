"use server";

import { prisma } from "@/lib/prisma";
import { activeCardWhere } from "./card-status";

export const getCardsByProductId = async (id: string) => {
  if (!id) return [];

  try {
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
      where: {
        AND: [activeCardWhere(), { productId: id }],
      },
    });

    return cards.map((card) => ({
      ...card,
      price: card.price ?? null,
    }));
  } catch (error) {
    throw new Error(`No se pudo cargar las cartas ${error}`);
  }
};
