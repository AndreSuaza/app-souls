"use server";

import { prisma } from "@/lib/prisma";
import { FinalizeTournamentSchema } from "@/schemas";

export async function finalizeTournamentAction(input: {
  tournamentId: string;
  players: { userId: string; wins: number }[];
}) {
  try {
    const data = FinalizeTournamentSchema.parse(input);

    await prisma.$transaction([
      prisma.tournament.update({
        where: { id: data.tournamentId },
        data: {
          status: "finished",
        },
      }),
      ...data.players.map((player) =>
        prisma.user.update({
          where: { id: player.userId },
          data: {
            victoryPoints: { increment: player.wins },
            eloPoints: { increment: player.wins },
            tournamentsPlayed: { increment: 1 },
          },
        })
      ),
    ]);
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[finalizeTournament]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error ? error.message : "Error al finalizar el torneo"
    );
  }
}
