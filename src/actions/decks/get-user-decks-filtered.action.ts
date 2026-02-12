"use server";

import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DeckFiltersSchema, type DeckFiltersInput } from "@/schemas";

export async function getUserDecksFilteredAction(input: DeckFiltersInput) {
  const filters = DeckFiltersSchema.parse(input);
  const perPage = 16;
  const session = await auth();
  const userId = session?.user?.idd;

  if (!userId) {
    return {
      decks: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      perPage,
      likedDeckIds: [],
    };
  }

  const where: Prisma.DeckWhereInput = {
    userId,
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
    where.likesCount = { gt: 0 };
  }

  if (typeof filters.minCardsNumber === "number") {
    where.cardsNumber = { gte: filters.minCardsNumber };
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

  const tournamentIds = Array.from(
    new Set(
      decks
        .map((deck) => deck.tournamentId)
        .filter((tournamentId): tournamentId is string =>
          Boolean(tournamentId),
        ),
    ),
  );

  const tournaments = tournamentIds.length
    ? await prisma.tournament.findMany({
        where: { id: { in: tournamentIds } },
        select: {
          id: true,
          status: true,
          finishedAt: true,
          typeTournament: {
            select: { name: true },
          },
        },
      })
    : [];

  const tournamentMap = new Map(
    tournaments.map((tournament) => [
      tournament.id,
      {
        id: tournament.id,
        status: tournament.status,
        finishedAt: tournament.finishedAt
          ? tournament.finishedAt.toISOString()
          : null,
        typeTournamentName: tournament.typeTournament?.name ?? null,
      },
    ]),
  );

  // Trae los likes del usuario para pintar el corazon solo cuando el usuario realmente dio like.
  const likedDeckIds = decks.length
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

  const decksWithTournament = decks.map((deck) => ({
    ...deck,
    tournament: deck.tournamentId
      ? tournamentMap.get(deck.tournamentId) ?? null
      : null,
  }));

  return {
    decks: decksWithTournament,
    totalCount,
    totalPages,
    currentPage,
    perPage,
    likedDeckIds,
  };
}
