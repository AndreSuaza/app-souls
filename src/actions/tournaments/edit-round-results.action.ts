"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isTopCutStage } from "@/logic";
import { assertCanManageTournament } from "./tournament-action-auth";

const EditRoundResultsSchema = z.object({
  matches: z.array(
    z.object({
      id: z.string().min(1),
      player2Id: z.string().nullable(),
      result: z.enum(["P1", "P2", "DRAW"]).nullable(),
    })
  ),
  players: z.array(
    z.object({
      id: z.string().min(1),
      points: z.number().int(),
    })
  ),
});

type EditRoundResultsInput = {
  matches: z.infer<typeof EditRoundResultsSchema>["matches"];
  players: z.infer<typeof EditRoundResultsSchema>["players"];
};

export const editRoundResultsAction = async ({
  matches,
  players,
}: EditRoundResultsInput): Promise<void> => {
  try {
    const data = EditRoundResultsSchema.parse({ matches, players });
    const matchIds = data.matches.map((match) => match.id);
    const playerIds = data.players.map((player) => player.id);

    const [persistedMatches, persistedPlayers] = await Promise.all([
      prisma.match.findMany({
        where: { id: { in: matchIds } },
        select: {
          id: true,
          result: true,
          round: { select: { stage: true, tournamentId: true } },
        },
      }),
      playerIds.length > 0
        ? prisma.tournamentPlayer.findMany({
            where: { id: { in: playerIds } },
            select: { id: true, points: true, tournamentId: true },
          })
        : Promise.resolve([]),
    ]);

    const tournamentIds = new Set([
      ...persistedMatches.map((match) => match.round.tournamentId),
      ...persistedPlayers.map((player) => player.tournamentId),
    ]);

    if (tournamentIds.size > 1) {
      throw new Error("Los cambios deben pertenecer a un solo torneo.");
    }

    const tournamentId = tournamentIds.values().next().value as
      | string
      | undefined;

    if (tournamentId) {
      await assertCanManageTournament(tournamentId);
    }

    const persistedMatchById = new Map(
      persistedMatches.map((match) => [match.id, match])
    );
    const persistedPlayerById = new Map(
      persistedPlayers.map((player) => [player.id, player])
    );

    const changedMatches = data.matches.filter((match) => {
      if (match.player2Id === null) return false;

      const persistedMatch = persistedMatchById.get(match.id);
      if (!persistedMatch) {
        throw new Error("Match no encontrado.");
      }

      if (match.result === "DRAW" && isTopCutStage(persistedMatch.round.stage)) {
        throw new Error("El bracket Top 8 no permite empates.");
      }

      return persistedMatch.result !== match.result;
    });

    const changedPlayers = data.players.filter((player) => {
      const persistedPlayer = persistedPlayerById.get(player.id);
      if (!persistedPlayer) {
        throw new Error("Jugador de torneo no encontrado.");
      }

      return persistedPlayer.points !== player.points;
    });

    if (changedMatches.length === 0 && changedPlayers.length === 0) {
      return;
    }

    // Solo persiste diferencias reales para evitar transacciones largas en torneos grandes.
    await prisma.$transaction([
      ...changedMatches.map((match) =>
        prisma.match.update({
          where: { id: match.id },
          data: { result: match.result },
        })
      ),
      ...changedPlayers.map((player) =>
        prisma.tournamentPlayer.update({
          where: { id: player.id },
          data: { points: player.points },
        })
      ),
    ]);
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[editRoundResultAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error al editar el resultado de la ronda"
    );
  }
};
