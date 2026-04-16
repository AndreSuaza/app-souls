"use server";

import { prisma } from "@/lib/prisma";
import { PublicUserIdSchema } from "@/schemas";

type PublicDeckCountsInput = {
  userId: string;
};

export const getPublicDeckCountsAction = async (
  input: PublicDeckCountsInput,
) => {
  const parsed = PublicUserIdSchema.safeParse(input);
  if (!parsed.success) {
    return { publicDecks: 0 };
  }

  const adminDeckFilter = {
    OR: [{ isAdminDeck: false }, { isAdminDeck: { isSet: false } }],
  };

  // Conteo exclusivo de mazos publicos para el perfil abierto.
  const publicDecks = await prisma.deck.count({
    where: {
      userId: parsed.data.userId,
      visible: true,
      AND: [adminDeckFilter],
    },
  });

  return { publicDecks };
};
