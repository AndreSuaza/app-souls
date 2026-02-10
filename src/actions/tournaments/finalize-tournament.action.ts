"use server";

import { prisma } from "@/lib/prisma";
import { FinalizeTournamentSchema } from "@/schemas";

export async function finalizeTournamentAction(input: {
  tournamentId: string;
  players: { userId: string; wins: number; matches: number }[];
}) {
  try {
    const data = FinalizeTournamentSchema.parse(input);

    await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.update({
        where: { id: data.tournamentId },
        data: {
          status: "finished",
        },
        select: {
          id: true,
          typeTournament: {
            select: { name: true },
          },
        },
      });

      for (const player of data.players) {
        await tx.user.update({
          where: { id: player.userId },
          data: {
            victoryPoints: { increment: player.wins },
            eloPoints: { increment: player.wins },
            matchesPlayed: { increment: player.matches },
            tournamentsPlayed: { increment: 1 },
          },
        });
      }

      const tournamentTypeName = tournament.typeTournament?.name ?? "";
      const isCompetitiveTier = ["Tier 1", "Tier 2"].includes(
        tournamentTypeName,
      );

      if (isCompetitiveTier) {
        // En Tier 1/2 los mazos quedan públicos automáticamente al finalizar.
        await tx.deck.updateMany({
          where: { tournamentId: tournament.id },
          data: { visible: true },
        });
      }
    });
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[finalizeTournament]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error ? error.message : "Error al finalizar el torneo",
    );
  }
}
