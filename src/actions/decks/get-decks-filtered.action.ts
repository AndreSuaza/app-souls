"use server";

import type { Prisma } from "@prisma/client";
import type { DeckFilteredResult } from "@/interfaces";
import { prisma } from "@/lib/prisma";
import { DeckFiltersSchema, type DeckFiltersInput } from "@/schemas";
import { auth } from "@/auth";

export async function getDecksFilteredAction(
  input: DeckFiltersInput,
): Promise<DeckFilteredResult> {
  const filters = DeckFiltersSchema.parse(input);
  const perPage = 24;
  const adminDeckFilter: Prisma.DeckWhereInput = {
    OR: [{ isAdminDeck: false }, { isAdminDeck: { isSet: false } }],
  };

  const where: Prisma.DeckWhereInput = {
    // Regla de negocio: solo mazos publicos y con el minimo de cartas.
    visible: true,
    cardsNumber: { gte: 40 },
    // Excluye mazos estructurados del panel admin.
    AND: [adminDeckFilter],
  };

  // El filtro de torneos ahora prioriza el orden sin excluir mazos.
  const tournamentPriority =
    filters.tournament === "without" ? "without" : "with";

  if (filters.archetypeId) {
    where.archetypeId = filters.archetypeId;
  }

  if (filters.likes) {
    // Cuando se filtra por likes, se exige al menos 1 y se prioriza el orden por popularidad.
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

  const decks = await prisma.deck.findMany({
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
  });

  const uniqueUserIds = Array.from(
    new Set(decks.map((deck) => deck.userId).filter(Boolean)),
  );

  // Evita romper el listado cuando existan mazos con userId sin usuario asociado.
  const users = uniqueUserIds.length
    ? await prisma.user.findMany({
        where: { id: { in: uniqueUserIds } },
        select: {
          id: true,
          nickname: true,
          name: true,
          lastname: true,
        },
      })
    : [];

  const userMap = new Map(users.map((user) => [user.id, user]));
  const decksWithUser = decks.map((deck) => {
    const user = userMap.get(deck.userId);
    return {
      ...deck,
      user: {
        nickname: user?.nickname ?? null,
        name: user?.name ?? null,
        lastname: user?.lastname ?? null,
      },
    };
  });

  const session = await auth();
  const userId = session?.user?.idd;

  const likedDeckIds = userId
    ? (
        await prisma.like.findMany({
          where: {
            userId,
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
