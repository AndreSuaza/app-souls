"use server";

import { prisma } from "@/lib/prisma";

export async function deletePlayerAction(playerId: string) {
  if (!playerId) throw new Error("Jugador no encontrado");

  await prisma.tournamentPlayer.delete({
    where: { id: playerId },
  });

  return { id: playerId };
}
