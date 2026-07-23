"use server";

import { prisma } from "@/lib/prisma";
import { CardIdSchema, type CardIdInput } from "@/schemas";
import { activeCardWhere } from "./card-status";

export async function getCardByIdAction(input: CardIdInput) {
  const { cardId } = CardIdSchema.parse(input);

  const card = await prisma.card.findFirst({
    where: {
      AND: [activeCardWhere(), { OR: [{ id: cardId }, { idd: cardId }] }],
    },
    select: {
      id: true,
      idd: true,
      code: true,
      name: true,
      slug: true,
      imageUrl: true,
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
    imageUrl: card.imageUrl ?? null,
    rarityName: card.rarities[0]?.name ?? null,
  };
}
