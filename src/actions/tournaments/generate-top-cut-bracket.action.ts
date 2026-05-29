"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GenerateTopCutBracketSchema } from "@/schemas";
import {
  getTopCutPlayerBySeed,
  getTopCutSeededPlayers,
  isTopCutTournamentType,
  TOP_CUT_QUARTERFINAL_PAIRINGS,
  TOP_CUT_SIZE,
} from "@/logic";
import type { TournamentPlayerInterface } from "@/interfaces";

type Input = {
  tournamentId: string;
  topCutPvBonus: number;
};

const mapTournamentPlayer = (player: {
  id: string;
  userId: string;
  playerNickname: string;
  name: string | null;
  lastname: string | null;
  image: string | null;
  points: number;
  pointsInitial: number;
  hadBye: boolean;
  buchholz: number;
  rivals: string[];
  deckId: string | null;
  topCutSeed: number | null;
}): TournamentPlayerInterface => ({
  id: player.id,
  userId: player.userId,
  playerNickname: player.playerNickname,
  name: player.name ?? undefined,
  lastname: player.lastname ?? undefined,
  image: player.image ?? undefined,
  points: player.points,
  pointsInitial: player.pointsInitial,
  hadBye: player.hadBye,
  buchholz: player.buchholz,
  rivals: player.rivals,
  deckId: player.deckId ?? undefined,
  topCutSeed: player.topCutSeed,
});

export async function generateTopCutBracketAction(input: Input) {
  const data = GenerateTopCutBracketSchema.parse(input);
  const session = await auth();

  if (!session?.user) {
    throw new Error("No autorizado");
  }

  if (session.user.role !== "admin" && session.user.role !== "store") {
    throw new Error("No autorizado");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({
        where: { id: data.tournamentId },
        select: {
          id: true,
          status: true,
          storeId: true,
          currentRoundNumber: true,
          maxRounds: true,
          topCutGeneratedAt: true,
          typeTournament: { select: { name: true } },
          tournamentPlayers: true,
        },
      });

      if (!tournament) {
        throw new Error("Torneo no encontrado");
      }

      if (
        session.user.role === "store" &&
        (!session.user.storeId || session.user.storeId !== tournament.storeId)
      ) {
        throw new Error("No autorizado");
      }

      if (!isTopCutTournamentType(tournament.typeTournament?.name)) {
        throw new Error("El bracket Top 8 solo aplica para torneos Tier 1.");
      }

      if (tournament.status === "finished" || tournament.status === "cancelled") {
        throw new Error("El torneo no permite generar bracket.");
      }

      if (tournament.topCutGeneratedAt) {
        throw new Error("El bracket Top 8 ya fue generado.");
      }

      if (tournament.currentRoundNumber < tournament.maxRounds) {
        throw new Error("Primero debes finalizar todas las rondas suizas.");
      }

      if (tournament.tournamentPlayers.length < TOP_CUT_SIZE) {
        throw new Error("Se requieren al menos 8 jugadores para generar Top 8.");
      }

      const topCutGeneratedAt = new Date();
      const seededPlayers = getTopCutSeededPlayers(
        tournament.tournamentPlayers.map(mapTournamentPlayer),
      );

      await tx.tournament.update({
        where: { id: tournament.id },
        data: {
          topCutGeneratedAt,
          topCutPvBonus: data.topCutPvBonus,
        },
      });

      await tx.tournamentPlayer.updateMany({
        where: { tournamentId: tournament.id },
        data: { topCutSeed: null },
      });

      for (const player of seededPlayers) {
        await tx.tournamentPlayer.update({
          where: { id: player.id },
          data: { topCutSeed: player.topCutSeed },
        });
      }

      const createdRound = await tx.round.create({
        data: {
          tournamentId: tournament.id,
          roundNumber: tournament.maxRounds + 1,
          stage: "TOP8_QUARTERFINAL",
          startedAt: null,
          matches: {
            create: TOP_CUT_QUARTERFINAL_PAIRINGS.map(
              ([player1Seed, player2Seed], index) => {
                const player1 = getTopCutPlayerBySeed(seededPlayers, player1Seed);
                const player2 = getTopCutPlayerBySeed(seededPlayers, player2Seed);

                if (!player1 || !player2) {
                  throw new Error("No se pudo construir el bracket Top 8.");
                }

                return {
                  player1Id: player1.id,
                  player1Nickname: player1.playerNickname,
                  player2Id: player2.id,
                  player2Nickname: player2.playerNickname,
                  result: null,
                  bracketPosition: index + 1,
                };
              },
            ),
          },
        },
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
            orderBy: { bracketPosition: "asc" },
          },
        },
      });

      return {
        topCutGeneratedAt: topCutGeneratedAt.toISOString(),
        topCutPvBonus: data.topCutPvBonus,
        seededPlayers: seededPlayers.map((player) => ({
          id: player.id,
          topCutSeed: player.topCutSeed,
        })),
        round: {
          ...createdRound,
          startedAt: createdRound.startedAt
            ? createdRound.startedAt.toISOString()
            : null,
          finishedAt: createdRound.finishedAt
            ? createdRound.finishedAt.toISOString()
            : null,
        },
      };
    });
  } catch (error) {
    console.error("[generateTopCutBracketAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error al generar el bracket Top 8",
    );
  }
}
