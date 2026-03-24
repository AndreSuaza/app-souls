"use server";

import { prisma } from "@/lib/prisma";
import { CardIdSchema, type CardIdInput } from "@/schemas";

export async function getCardByIdAction(input: CardIdInput) {
  const { cardId } = CardIdSchema.parse(input);

  const card = await prisma.card.findFirst({
    where: {
      OR: [{ id: cardId }, { idd: cardId }],
    },
    select: {
      id: true,
      idd: true,
      code: true,
      name: true,
      slug: true,
      rarities: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!card) return null;

  return {
    id: card.id,
    idd: card.idd,
    code: card.code,
    name: card.name,
    slug: card.slug,
    rarityName: card.rarities[0]?.name ?? null,
  };
}
