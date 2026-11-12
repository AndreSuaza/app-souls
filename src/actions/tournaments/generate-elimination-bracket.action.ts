"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GenerateEliminationBracketSchema } from "@/schemas";
import type { TournamentPlayerInterface } from "@/interfaces";
import { getInitialEliminationPlan } from "@/logic";
import { assertCanManageTournament } from "./tournament-action-auth";

type Input = { tournamentId: string };

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

export async function generateEliminationBracketAction(input: Input) {
  const data = GenerateEliminationBracketSchema.parse(input);
  const session = await auth();

  if (!session?.user) throw new Error("No autorizado");
  await assertCanManageTournament(data.tournamentId);

  try {
    return await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({
        where: { id: data.tournamentId },
        select: {
          id: true,
          format: true,
          status: true,
          eliminationGeneratedAt: true,
          tournamentPlayers: {
            orderBy: [{ createDate: "asc" }, { id: "asc" }],
          },
        },
      });

      if (!tournament) throw new Error("Torneo no encontrado");
      if (tournament.format !== "Elimination") {
        throw new Error("Este torneo no usa eliminación directa");
      }
      if (tournament.status === "finished" || tournament.status === "cancelled") {
        throw new Error("El torneo no permite iniciar el bracket");
      }
      if (tournament.eliminationGeneratedAt) {
        throw new Error("El bracket de eliminación ya fue generado");
      }
      if (tournament.status !== "pending") {
        throw new Error("El bracket solo puede generarse antes de iniciar el torneo");
      }
      if (tournament.tournamentPlayers.length < 8) {
        throw new Error("Se requieren al menos 8 jugadores para iniciar el bracket");
      }
      const existingRounds = await tx.round.count({
        where: { tournamentId: tournament.id },
      });
      if (existingRounds > 0) {
        throw new Error("El torneo ya tiene rondas generadas");
      }

      const players = tournament.tournamentPlayers.map(mapPlayer);
      const plan = getInitialEliminationPlan(players);
      const eliminationGeneratedAt = new Date();

      await tx.tournament.update({
        where: { id: tournament.id },
        data: {
          status: "in_progress",
          maxRounds: plan.maxRounds,
          eliminationGeneratedAt,
        },
      });

      await tx.tournamentPlayer.updateMany({
        where: { tournamentId: tournament.id },
        data: { topCutSeed: null },
      });

      for (const player of plan.seededPlayers) {
        await tx.tournamentPlayer.update({
          where: { id: player.id },
          data: { topCutSeed: player.topCutSeed },
        });
      }

      const createdRound = await tx.round.create({
        data: {
          tournamentId: tournament.id,
          roundNumber: 1,
          stage: plan.stage,
          bracketSize: plan.bracketSize,
          layoutRevision: 0,
          startedAt: null,
          matches: {
            create: plan.matches.map(({ player1, player2, bracketPosition }) => ({
              player1Id: player1.id,
              player1Nickname: player1.playerNickname,
              player2Id: player2?.id ?? null,
              player2Nickname: player2?.playerNickname ?? "BYE",
              result: player2 ? null : "P1",
              bracketPosition,
            })),
          },
        },
        select: {
          id: true,
          roundNumber: true,
          stage: true,
          bracketSize: true,
          layoutRevision: true,
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
        eliminationGeneratedAt: eliminationGeneratedAt.toISOString(),
        maxRounds: plan.maxRounds,
        seededPlayers: plan.seededPlayers.map((player) => ({
          id: player.id,
          topCutSeed: player.topCutSeed,
        })),
        round: {
          ...createdRound,
          startedAt: createdRound.startedAt?.toISOString() ?? null,
          finishedAt: createdRound.finishedAt?.toISOString() ?? null,
        },
      };
    }, {
      maxWait: 10000,
      timeout: 15000,
    });
  } catch (error) {
    console.error("[generateEliminationBracketAction]", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error al generar el bracket de eliminación",
    );
  }
}
