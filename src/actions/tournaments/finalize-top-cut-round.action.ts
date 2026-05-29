"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FinalizeTopCutRoundSchema } from "@/schemas";
import {
  assertTopCutRoundResolved,
  buildTopCutFinalPairing,
  buildTopCutSemifinalPairings,
  getNextTopCutStage,
  isTopCutStage,
} from "@/logic";
import type { MatchInterface, RoundStage, TournamentPlayerInterface } from "@/interfaces";

type Input = {
  tournamentId: string;
  roundId: string;
};

const mapMatch = (match: {
  id: string;
  player1Id: string;
  player1Nickname: string;
  player2Id: string | null;
  player2Nickname: string | null;
  result: "P1" | "P2" | "DRAW" | null;
  bracketPosition: number | null;
}): MatchInterface => ({
  id: match.id,
  player1Id: match.player1Id,
  player1Nickname: match.player1Nickname,
  player2Id: match.player2Id,
  player2Nickname: match.player2Nickname,
  result: match.result,
  bracketPosition: match.bracketPosition,
});

const mapPlayer = (player: {
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

export async function finalizeTopCutRoundAction(input: Input) {
  const data = FinalizeTopCutRoundSchema.parse(input);
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
          storeId: true,
          status: true,
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

      if (tournament.status === "finished" || tournament.status === "cancelled") {
        throw new Error("El torneo no permite finalizar rondas de bracket.");
      }

      const round = await tx.round.findUnique({
        where: { id: data.roundId },
        select: {
          id: true,
          tournamentId: true,
          roundNumber: true,
          stage: true,
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

      if (!round || round.tournamentId !== tournament.id) {
        throw new Error("Ronda de bracket no encontrada");
      }

      if (!isTopCutStage(round.stage as RoundStage | null)) {
        throw new Error("Esta ronda no pertenece al bracket Top 8.");
      }

      if (round.finishedAt) {
        throw new Error("Esta ronda de bracket ya fue finalizada.");
      }

      const matches = round.matches.map(mapMatch);
      assertTopCutRoundResolved(matches);

      await tx.round.update({
        where: { id: round.id },
        data: { finishedAt: new Date() },
      });

      await tx.tournament.update({
        where: { id: tournament.id },
        data: { currentRoundNumber: { increment: 1 } },
      });

      const nextStage = getNextTopCutStage(round.stage as RoundStage | null);
      if (!nextStage) {
        return { nextRound: null };
      }

      const players = tournament.tournamentPlayers.map(mapPlayer);
      const nextPairings =
        nextStage === "TOP8_SEMIFINAL"
          ? buildTopCutSemifinalPairings(matches, players)
          : buildTopCutFinalPairing(matches, players);

      const nextRound = await tx.round.create({
        data: {
          tournamentId: tournament.id,
          roundNumber: round.roundNumber + 1,
          stage: nextStage,
          startedAt: null,
          matches: {
            create: nextPairings.map((pairing) => ({
              player1Id: pairing.player1.id,
              player1Nickname: pairing.player1.playerNickname,
              player2Id: pairing.player2.id,
              player2Nickname: pairing.player2.playerNickname,
              result: null,
              bracketPosition: pairing.bracketPosition,
            })),
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
        nextRound: {
          ...nextRound,
          startedAt: nextRound.startedAt ? nextRound.startedAt.toISOString() : null,
          finishedAt: nextRound.finishedAt
            ? nextRound.finishedAt.toISOString()
            : null,
        },
      };
    });
  } catch (error) {
    console.error("[finalizeTopCutRoundAction]", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error al finalizar la ronda del bracket",
    );
  }
}
