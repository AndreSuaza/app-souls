"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const getProfileDeckCountsAction = async () => {
  const session = await auth();
  const userId = session?.user?.idd;

  if (!userId) {
    return { totalDecks: 0, publicDecks: 0 };
  }

  // Excluye mazos de administrador para mantener el conteo del perfil del jugador.
  const adminDeckFilter = {
    OR: [{ isAdminDeck: false }, { isAdminDeck: { isSet: false } }],
  };

  const [totalDecks, publicDecks] = await prisma.$transaction([
    prisma.deck.count({
      where: {
        userId,
        AND: [adminDeckFilter],
      },
    }),
    prisma.deck.count({
      where: {
        userId,
        visible: true,
        AND: [adminDeckFilter],
      },
    }),
  ]);

  return { totalDecks, publicDecks };
};
