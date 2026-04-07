"use server";

import type { Prisma } from "@prisma/client";
import type { DeckFilteredResult } from "@/interfaces";
import { prisma } from "@/lib/prisma";
import { PublicDecksByUserSchema, type PublicDecksByUserInput } from "@/schemas";
import { auth } from "@/auth";

export async function getPublicDecksByUserAction(
  input: PublicDecksByUserInput,
): Promise<DeckFilteredResult> {
  const filters = PublicDecksByUserSchema.parse(input);
  const perPage = 16;
  const adminDeckFilter: Prisma.DeckWhereInput = {
    OR: [{ isAdminDeck: false }, { isAdminDeck: { isSet: false } }],
  };

  // Perfil publico: solo mazos visibles y con el minimo de cartas.
  const where: Prisma.DeckWhereInput = {
    userId: filters.userId,
    visible: true,
    cardsNumber: { gte: 40 },
    AND: [adminDeckFilter],
  };

  const tournamentPriority =
    filters.tournament === "without" ? "without" : "with";

  if (filters.archetypeId) {
    where.archetypeId = filters.archetypeId;
  }

  if (filters.likes) {
    where.likesCount = { gt: 0 };
  }

  const priorityOrder: Prisma.DeckOrderByWithRelationInput[] = [
    {
      tournamentId: tournamentPriority === "with" ? "desc" : "asc",
    },
  ];

  const orderBy = filters.likes
    ? [
        ...priorityOrder,
        { likesCount: "desc" as const },
        { createdAt: "desc" as const },
      ]
    : [
        ...priorityOrder,
        {
          createdAt:
            filters.date === "old" ? ("asc" as const) : ("desc" as const),
        },
      ];

  const totalCount = await prisma.deck.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const currentPage = Math.min(filters.page, totalPages);
  const skip = (currentPage - 1) * perPage;

  const [decks, user] = await Promise.all([
    prisma.deck.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      include: {
        archetype: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: filters.userId },
      select: {
        nickname: true,
        name: true,
        lastname: true,
      },
    }),
  ]);

  const userSnapshot = {
    nickname: user?.nickname ?? null,
    name: user?.name ?? null,
    lastname: user?.lastname ?? null,
  };

  const decksWithUser = decks.map((deck) => ({
    ...deck,
    user: userSnapshot,
  }));

  const session = await auth();
  const viewerId = session?.user?.idd;

  const likedDeckIds = viewerId
    ? (
        await prisma.like.findMany({
          where: {
            userId: viewerId,
            deckId: { in: decks.map((deck) => deck.id) },
          },
          select: { deckId: true },
        })
      ).map((like) => like.deckId)
    : [];

  return {
    decks: decksWithUser,
    totalCount,
    totalPages,
    currentPage,
    perPage,
    likedDeckIds,
  };
}
