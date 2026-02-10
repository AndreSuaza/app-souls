"use server";

import { prisma } from "@/lib/prisma";

export const getDeckById = async (id: string) => {
  try {
    const deck = await prisma.deck.findFirst({
      include: {
        user: {
          select: {
            nickname: true,
            name: true,
            lastname: true,
          },
        },
        archetype: {
          select: {
            id: true,
            name: true,
          },
        },
        tournamentPlayers: {
          select: {
            userId: true,
          },
        },
      },
      where: {
        id: id,
      },
    });

    if (!deck) {
      return null;
    }

    let tournamentInfo: {
      id: string;
      status: string;
      finishedAt?: string | null;
      typeTournamentName?: string | null;
    } | null = null;

    if (deck.tournamentId) {
      const tournament = await prisma.tournament.findUnique({
        where: { id: deck.tournamentId },
        select: {
          id: true,
          status: true,
          finishedAt: true,
          typeTournament: {
            select: { name: true },
          },
        },
      });

      if (tournament) {
        tournamentInfo = {
          id: tournament.id,
          status: tournament.status,
          finishedAt: tournament.finishedAt
            ? tournament.finishedAt.toISOString()
            : null,
          typeTournamentName: tournament.typeTournament?.name ?? null,
        };
      }
    }

    return {
      ...deck,
      tournament: tournamentInfo,
    };
  } catch (error) {
    throw new Error(`Error en la sesion ${error}`);
  }
};
