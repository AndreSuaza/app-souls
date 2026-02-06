"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { IdSchema } from "@/schemas";

interface DeckLikeStatusResult {
  liked: boolean;
}

export async function getDeckLikeStatusAction(
  deckId: string,
): Promise<DeckLikeStatusResult> {
  const id = IdSchema.parse(deckId);
  const session = await auth();
  const userId = session?.user?.idd;

  if (!userId) {
    return { liked: false };
  }

  const existing = await prisma.like.findFirst({
    where: {
      userId,
      deckId: id,
    },
    select: { id: true },
  });

  return { liked: Boolean(existing) };
}
