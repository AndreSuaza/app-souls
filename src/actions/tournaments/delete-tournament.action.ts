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
    if (status === "cancelled") {
      throw new Error("El torneo ya esta cancelado");
    }

    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "cancelled" },
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
