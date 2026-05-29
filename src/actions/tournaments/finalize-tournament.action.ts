"use server";

import { prisma } from "@/lib/prisma";
import { FinalizeTournamentSchema } from "@/schemas";
import { assertCanManageTournament } from "./tournament-action-auth";

export async function finalizeTournamentAction(input: {
  tournamentId: string;
  players: { userId: string; wins: number; matches: number }[];
}) {
  try {
    const data = FinalizeTournamentSchema.parse(input);
    await assertCanManageTournament(data.tournamentId);

    const tournament = await prisma.tournament.findUnique({
      where: { id: data.tournamentId },
      select: {
        id: true,
        status: true,
        topCutPvBonus: true,
        tournamentPlayers: {
          select: {
            userId: true,
            topCutSeed: true,
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

    const topCutBonus = tournament.topCutPvBonus ?? 0;
    const topCutUserIds = new Set(
      tournament.tournamentPlayers
        .filter((player) => typeof player.topCutSeed === "number")
        .map((player) => player.userId),
    );

    const playersByIncrement = new Map<
      string,
      {
        userIds: string[];
        victoryPoints: number;
        eloPoints: number;
        matchesPlayed: number;
      }
    >();

    data.players.forEach((player) => {
      const topCutVictoryBonus = topCutUserIds.has(player.userId)
        ? topCutBonus
        : 0;
      const victoryPoints = player.wins + topCutVictoryBonus;
      const key = `${victoryPoints}:${player.wins}:${player.matches}`;
      const group = playersByIncrement.get(key);

      if (group) {
        group.userIds.push(player.userId);
        return;
      }

      playersByIncrement.set(key, {
        userIds: [player.userId],
        victoryPoints,
        eloPoints: player.wins,
        matchesPlayed: player.matches,
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
