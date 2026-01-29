"use server";

import { prisma } from "@/lib/prisma";

export const getDeckById = async (id: string) => {
  try {
    const decks = await prisma.deck.findFirst({
      include: {
        user: {
          select: {
            nickname: true,
            name: true,
            lastname: true,
          },
        },
        archetype: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        id: id,
      },
    });

    return decks;
  } catch (error) {
    throw new Error(`Error en la sesion ${error}`);
  }
};
