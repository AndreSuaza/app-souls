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
  const perPage = 32;

  const where: Prisma.DeckWhereInput = {
    // Regla de negocio: solo mazos publicos y con el minimo de cartas.
    visible: true,
    cardsNumber: { gte: 40 },
  };

  if (filters.tournament === "with") {
    where.tournamentId = { not: null };
  }

  if (filters.tournament === "without") {
    // En Mongo, "null" no siempre cubre documentos donde el campo no existe.
    // Cubrimos ambos casos para que "Sin torneo" funcione de forma consistente.
    where.OR = [{ tournamentId: null }, { tournamentId: { isSet: false } }];
  }

  if (filters.archetypeId) {
    where.archetypeId = filters.archetypeId;
  }

  if (filters.likes) {
    // Cuando se filtra por likes, se exige al menos 1 y se prioriza el orden por popularidad.
    where.likesCount = { gt: 0 };
  }

  const orderBy = filters.likes
    ? [{ likesCount: "desc" as const }, { createdAt: "desc" as const }]
    : [
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
      user: {
        select: {
          nickname: true,
        },
      },
      archetype: {
        select: {
          id: true,
          name: true,
        },
      },
    },
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
    decks,
    totalCount,
    totalPages,
    currentPage,
    perPage,
    likedDeckIds,
  };
}
