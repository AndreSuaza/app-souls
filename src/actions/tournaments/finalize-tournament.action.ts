"use server";

import { prisma } from "@/lib/prisma";
import { FinalizeTournamentSchema } from "@/schemas";
import {
  getTopCutPvByPlayerId,
  isSwissStage,
  isTopCutTournamentType,
} from "@/logic";
import { assertCanManageTournament } from "./tournament-action-auth";

export async function finalizeTournamentAction(input: {
  tournamentId: string;
}) {
  try {
    const data = FinalizeTournamentSchema.parse(input);
    await assertCanManageTournament(data.tournamentId);

    const tournament = await prisma.tournament.findUnique({
      where: { id: data.tournamentId },
      select: {
        id: true,
        status: true,
        typeTournament: {
          select: {
            name: true,
          },
        },
        tournamentPlayers: {
          select: {
            id: true,
            userId: true,
          },
        },
        tournamentRounds: {
          select: {
            stage: true,
            matches: {
              select: {
                player1Id: true,
                player2Id: true,
                result: true,
              },
            },
          },
        },
      },
    });

    if (!tournament) {
      throw new Error("Torneo no encontrado");
    }

    if (tournament.status === "finished") {
      throw new Error("El torneo ya fue finalizado");
    }

    const playerIdToUserId = new Map(
      tournament.tournamentPlayers.map((player) => [
        player.id,
        player.userId,
      ]),
    );
    const topCutPvByUserId = new Map<string, number>();
    const totalWinsByUserId = new Map(
      tournament.tournamentPlayers.map((player) => [player.userId, 0]),
    );
    const matchesByUserId = new Map(
      tournament.tournamentPlayers.map((player) => [player.userId, 0]),
    );

    // Todas las victorias, incluido el Top 8, aportan ELO y PV.
    tournament.tournamentRounds.forEach((round) => {
      round.matches.forEach((match) => {
        const incrementMatch = (playerId: string | null) => {
          if (!playerId) return;
          const userId = playerIdToUserId.get(playerId);
          if (!userId) return;
          matchesByUserId.set(
            userId,
            (matchesByUserId.get(userId) ?? 0) + 1,
          );
        };

        incrementMatch(match.player1Id);
        incrementMatch(match.player2Id);

        const winnerPlayerId =
          match.result === "P1"
            ? match.player1Id
            : match.result === "P2"
              ? match.player2Id
              : null;
        const winnerUserId = winnerPlayerId
          ? playerIdToUserId.get(winnerPlayerId)
          : null;

        if (winnerUserId) {
          totalWinsByUserId.set(
            winnerUserId,
            (totalWinsByUserId.get(winnerUserId) ?? 0) + 1,
          );
        }
      });
    });

    if (isTopCutTournamentType(tournament.typeTournament.name)) {
      const topCutPvByPlayerId = getTopCutPvByPlayerId(
        tournament.tournamentRounds.filter((round) => !isSwissStage(round.stage)),
      );

      topCutPvByPlayerId.forEach((pv, playerId) => {
        const userId = playerIdToUserId.get(playerId);
        if (!userId) {
          throw new Error("No se encontro un jugador clasificado al Top 8.");
        }
        topCutPvByUserId.set(userId, pv);
      });
    }

    const playersByIncrement = new Map<
      string,
      {
        userIds: string[];
        victoryPoints: number;
        eloPoints: number;
        matchesPlayed: number;
      }
    >();

    tournament.tournamentPlayers.forEach((player) => {
      const totalWins = totalWinsByUserId.get(player.userId) ?? 0;
      const matches = matchesByUserId.get(player.userId) ?? 0;
      const topCutVictoryBonus = topCutPvByUserId.get(player.userId) ?? 0;
      const victoryPoints = totalWins + topCutVictoryBonus;
      const key = `${victoryPoints}:${totalWins}:${matches}`;
      const group = playersByIncrement.get(key);

      if (group) {
        group.userIds.push(player.userId);
        return;
      }

      playersByIncrement.set(key, {
        userIds: [player.userId],
        victoryPoints,
        eloPoints: totalWins,
        matchesPlayed: matches,
      });
    });

    // Agrupa usuarios con el mismo incremento para evitar una transaccion larga.
    await prisma.$transaction([
      prisma.tournament.update({
        where: { id: data.tournamentId },
        data: {
          status: "finished",
          finishedAt: new Date(),
        },
        select: {
          id: true,
        },
      }),
      ...Array.from(playersByIncrement.values()).map((group) =>
        prisma.user.updateMany({
          where: { id: { in: group.userIds } },
          data: {
            victoryPoints: { increment: group.victoryPoints },
            eloPoints: { increment: group.eloPoints },
            matchesPlayed: { increment: group.matchesPlayed },
            tournamentsPlayed: { increment: 1 },
          },
        })
      ),
      // Al finalizar el torneo, todos los mazos asociados se vuelven públicos.
      prisma.deck.updateMany({
        where: { tournamentId: tournament.id },
        data: { visible: true },
      }),
    ]);
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[finalizeTournament]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error ? error.message : "Error al finalizar el torneo",
    );
  }
}
