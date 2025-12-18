"use server";

import { prisma } from "@/lib/prisma";

export async function finalizeTournamentAction(tournamentId: string) {
  try {
    if (!tournamentId) throw new Error("Torneo no encontrado");

    // Marcar torneo como finalizado
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        status: "finished",
      },
    });
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[finalizeTournament]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error ? error.message : "Error al finalizar el torneo"
    );
  }
}
