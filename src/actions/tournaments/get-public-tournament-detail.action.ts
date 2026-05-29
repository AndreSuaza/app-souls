"use server";

import { prisma } from "@/lib/prisma";
import { IdSchema } from "@/schemas";
import { type PublicTournamentDetail } from "@/interfaces";

type Input = {
  tournamentId: string;
};

export async function getPublicTournamentDetailAction(
  input: Input
): Promise<PublicTournamentDetail | null> {
  const id = IdSchema.parse(input.tournamentId);

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        status: true,
        currentRoundNumber: true,
        maxRounds: true,
        topCutGeneratedAt: true,
        topCutPvBonus: true,
        format: true,
        typeTournament: {
          select: {
            name: true,
          },
        },
        store: {
          select: {
            name: true,
            city: true,
            address: true,
            country: true,
            phone: true,
            lat: true,
            lgn: true,
          },
        },
        tournamentPlayers: {
          select: {
            id: true,
            userId: true,
            playerNickname: true,
            name: true,
            lastname: true,
            image: true,
            points: true,
            pointsInitial: true,
            buchholz: true,
            hadBye: true,
            rivals: true,
            deckId: true,
            topCutSeed: true,
          },
        },
        tournamentRounds: {
          select: {
            id: true,
            roundNumber: true,
            stage: true,
            startedAt: true,
            finishedAt: true,
            matches: {
              select: {
                id: true,
                player1Id: true,
                player1Nickname: true,
                player2Id: true,
                player2Nickname: true,
                result: true,
                bracketPosition: true,
              },
              orderBy: [{ bracketPosition: "asc" }, { createdAt: "asc" }],
            },
          },
          orderBy: {
            roundNumber: "asc",
          },
        },
      },
    });

    if (!tournament || tournament.status === "cancelled") {
      return null;
    }

    return {
      tournament: {
        id: tournament.id,
        title: tournament.title,
        description: tournament.description ?? null,
        date: tournament.date.toISOString(),
        status: tournament.status,
        currentRoundNumber: tournament.currentRoundNumber,
        maxRounds: tournament.maxRounds,
        topCutGeneratedAt: tournament.topCutGeneratedAt
          ? tournament.topCutGeneratedAt.toISOString()
          : null,
        topCutPvBonus: tournament.topCutPvBonus ?? null,
        format: tournament.format ?? null,
        typeTournamentName: tournament.typeTournament?.name ?? null,
      },
      store: {
        name: tournament.store.name,
        city: tournament.store.city,
        address: tournament.store.address,
        country: tournament.store.country,
        phone: tournament.store.phone ?? "",
        url: "",
        lat: tournament.store.lat,
        lgn: tournament.store.lgn,
      },
      players: tournament.tournamentPlayers.map((player) => ({
        id: player.id,
        userId: player.userId,
        playerNickname: player.playerNickname,
        name: player.name ?? undefined,
        lastname: player.lastname ?? undefined,
        image: player.image ?? undefined,
        points: player.points,
        pointsInitial: player.pointsInitial,
        buchholz: player.buchholz,
        hadBye: player.hadBye,
        rivals: player.rivals ?? [],
        deckId: player.deckId ?? undefined,
        topCutSeed: player.topCutSeed ?? null,
      })),
      rounds: tournament.tournamentRounds.map((round) => ({
        id: round.id,
        roundNumber: round.roundNumber,
        stage: round.stage ?? "SWISS",
        startedAt: round.startedAt ? round.startedAt.toISOString() : null,
        finishedAt: round.finishedAt ? round.finishedAt.toISOString() : null,
        matches: round.matches.map((match) => ({
          id: match.id,
          player1Id: match.player1Id,
          player2Id: match.player2Id,
          player1Nickname: match.player1Nickname,
          player2Nickname: match.player2Nickname ?? null,
          result: match.result,
          bracketPosition: match.bracketPosition ?? null,
        })),
      })),
    };
  } catch (error) {
    console.error("[getPublicTournamentDetailAction]", error);
    throw new Error("Error al consultar el torneo");
  }
}
