"use server";

import { prisma } from "@/lib/prisma";

export async function deleteTournamentAction(
  tournamentId: string,
  status: string
) {
  try {
    if (status === "finished") {
      throw new Error("No se puede cancelar un torneo finalizado");
    }

    // eliminar en cascada
    await prisma.$transaction(async (tx) => {
      // Eliminar matches
      await tx.match.deleteMany({
        where: {
          round: {
            tournamentId,
          },
        },
      });

      // Eliminar rondas
      await tx.round.deleteMany({
        where: { tournamentId },
      });

      // Eliminar jugadores
      await tx.tournamentPlayer.deleteMany({
        where: { tournamentId },
      });

      // Eliminar torneo
      await tx.tournament.delete({
        where: { id: tournamentId },
      });
    });
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[deleteTournamentAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error ? error.message : "Error al cancelar el torneo"
    );
  }
}
