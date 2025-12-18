"use server";

import { prisma } from "@/lib/prisma";

export async function deletePlayerAction(playerId: string) {
  try {
    if (!playerId) throw new Error("Jugador no encontrado");

    await prisma.tournamentPlayer.delete({
      where: { id: playerId },
    });

    return { id: playerId };
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[deletePlayerAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error eliminando el jugador del torneo"
    );
  }
}
