"use server";

import { prisma } from "@/lib/prisma";
import { CardIdSchema, type CardIdInput } from "@/schemas";

export async function getCardByIdAction(input: CardIdInput) {
  const { cardId } = CardIdSchema.parse(input);

  return prisma.card.findFirst({
    where: {
      OR: [{ id: cardId }, { idd: cardId }],
    },
    select: {
      id: true,
      idd: true,
      code: true,
      name: true,
    },
  });
}
