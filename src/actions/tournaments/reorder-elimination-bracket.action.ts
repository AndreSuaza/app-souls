"use server";

import { prisma } from "@/lib/prisma";
import {
  ReorderEliminationBracketSchema,
} from "@/schemas";
import { isEliminationStage } from "@/logic";
import type { RoundStage } from "@/interfaces";
import { assertCanManageTournament } from "./tournament-action-auth";

export async function reorderEliminationBracketAction(input: unknown) {
  const data = ReorderEliminationBracketSchema.parse(input);
  await assertCanManageTournament(data.tournamentId);

  try {
    return await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({
        where: { id: data.tournamentId },
        select: { id: true, format: true, status: true },
      });

      if (!tournament) throw new Error("Torneo no encontrado");
      if (tournament.format !== "Elimination") {
        throw new Error("Este torneo no usa eliminación directa");
      }
      if (tournament.status === "finished" || tournament.status === "cancelled") {
        throw new Error("El torneo no permite editar el bracket");
      }

      const round = await tx.round.findUnique({
        where: { id: data.roundId },
        select: {
          id: true,
          tournamentId: true,
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
              player2Id: true,
            },
            orderBy: { bracketPosition: "asc" },
          },
        },
      });

      if (!round || round.tournamentId !== tournament.id) {
        throw new Error("Ronda de eliminación no encontrada");
      }
      if (!isEliminationStage(round.stage as RoundStage | null)) {
        throw new Error("Esta ronda no pertenece al bracket de eliminación");
      }
      if (round.startedAt || round.finishedAt) {
        throw new Error("La ronda ya no permite editar el bracket");
      }
      if (round.layoutRevision !== data.layoutRevision) {
        throw new Error("El bracket cambió mientras lo editabas. Recarga la vista.");
      }

      const latestRound = await tx.round.findFirst({
        where: { tournamentId: tournament.id },
        orderBy: { roundNumber: "desc" },
        select: { id: true },
      });
      if (!latestRound || latestRound.id !== round.id) {
        throw new Error("Solo se puede editar la ronda pendiente actual");
      }

      const persistedMatchIds = new Set(round.matches.map((match) => match.id));
      const inputMatchIds = new Set(data.matches.map((match) => match.id));
      if (
        inputMatchIds.size !== data.matches.length ||
        inputMatchIds.size !== persistedMatchIds.size ||
        [...persistedMatchIds].some((id) => !inputMatchIds.has(id))
      ) {
        throw new Error("El layout del bracket está incompleto");
      }

      const persistedPlayerIds = new Set(
        round.matches.flatMap((match) =>
          match.player2Id ? [match.player1Id, match.player2Id] : [match.player1Id],
        ),
      );
      const inputPlayerIds = data.matches.flatMap((match) =>
        match.player2Id ? [match.player1Id, match.player2Id] : [match.player1Id],
      );
      const inputPlayerIdSet = new Set(inputPlayerIds);

      if (
        inputPlayerIds.length !== inputPlayerIdSet.size ||
        inputPlayerIdSet.size !== persistedPlayerIds.size ||
        [...persistedPlayerIds].some((id) => !inputPlayerIdSet.has(id))
      ) {
        throw new Error("El bracket contiene jugadores duplicados o inválidos");
      }

      const tournamentPlayers = await tx.tournamentPlayer.findMany({
        where: { tournamentId: tournament.id },
        select: { id: true, playerNickname: true },
      });
      const nicknameByPlayerId = new Map(
        tournamentPlayers.map((player) => [player.id, player.playerNickname]),
      );

      for (const playerId of inputPlayerIds) {
        if (!nicknameByPlayerId.has(playerId)) {
          throw new Error("El bracket contiene un jugador de otro torneo");
        }
      }

      const inputMatchById = new Map(data.matches.map((match) => [match.id, match]));
      const updatedMatches = round.matches.map((match) => {
        const nextMatch = inputMatchById.get(match.id);
        if (!nextMatch) throw new Error("Match no encontrado");

        const player1Nickname = nicknameByPlayerId.get(nextMatch.player1Id);
        if (!player1Nickname) throw new Error("Jugador 1 no encontrado");

        const player2Nickname = nextMatch.player2Id
          ? nicknameByPlayerId.get(nextMatch.player2Id)
          : "BYE";
        if (nextMatch.player2Id && !player2Nickname) {
          throw new Error("Jugador 2 no encontrado");
        }

        return {
          id: match.id,
          player1Id: nextMatch.player1Id,
          player1Nickname,
          player2Id: nextMatch.player2Id,
          player2Nickname,
          result: nextMatch.player2Id ? null : "P1" as const,
        };
      });

      const changedMatches = updatedMatches.filter((nextMatch) => {
        const currentMatch = round.matches.find(
          (match) => match.id === nextMatch.id,
        );

        return (
          currentMatch?.player1Id !== nextMatch.player1Id ||
          currentMatch?.player2Id !== nextMatch.player2Id
        );
      });

      const nextRevision = round.layoutRevision + 1;
      for (const match of changedMatches) {
        await tx.match.update({
          where: { id: match.id },
          data: {
            player1Id: match.player1Id,
            player1Nickname: match.player1Nickname,
            player2Id: match.player2Id,
            player2Nickname: match.player2Nickname,
            result: match.result,
          },
        });
      }
      await tx.round.update({
        where: { id: round.id },
        data: { layoutRevision: nextRevision },
      });

      const persistedRound = await tx.round.findUniqueOrThrow({
        where: { id: round.id },
        select: {
          id: true,
          layoutRevision: true,
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

      return persistedRound;
    });
  } catch (error) {
    console.error("[reorderEliminationBracketAction]", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error guardando el bracket de eliminación",
    );
  }
}
