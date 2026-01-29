"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DeckLikeSchema, type DeckLikeInput } from "@/schemas";

interface DeckLikeResult {
  liked: boolean;
}

export async function toggleDeckLikeAction(
  input: DeckLikeInput,
): Promise<DeckLikeResult> {
  const { deckId, like } = DeckLikeSchema.parse(input);
  const session = await auth();
  const userId = session?.user?.idd;

  if (!userId) {
    throw new Error("No autorizado");
  }

  const existing = await prisma.like.findFirst({
    where: {
      userId,
      deckId,
    },
    select: {
      id: true,
    },
  });

  if (like) {
    if (existing) {
      return { liked: true };
    }

    // Aplica el like y actualiza el contador del mazo en la misma operacion.
    await prisma.$transaction([
      prisma.like.create({
        data: {
          idLike: `deck-${deckId}-${userId}`,
          userId,
          deckId,
        },
      }),
      prisma.deck.update({
        where: { id: deckId },
        data: {
          likesCount: { increment: 1 },
        },
      }),
    ]);

    return { liked: true };
  }

  if (!existing) {
    return { liked: false };
  }

  const { count } = await prisma.like.deleteMany({
    where: {
      userId,
      deckId,
    },
  });

  if (count > 0) {
    // Solo decrementa si realmente existia el like.
    await prisma.deck.update({
      where: { id: deckId },
      data: {
        likesCount: { decrement: count },
      },
    });
  }

  return { liked: false };
}
