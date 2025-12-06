"use server";

import { prisma } from "@/lib/prisma";
import { IdSchema } from "@/schemas";

export async function deletePlayer_action(
  playerId: string,
  tournamentId: string
) {
  const pId = IdSchema.parse(playerId);
  const tId = IdSchema.parse(tournamentId);

  const tournament = await prisma.tournament.findUnique({
    where: { id: tId },
  });

  if (!tournament) throw new Error("Torneo no encontrado");

  if (tournament.status === "finished")
    throw new Error("No se puede eliminar jugadores de un torneo finalizado");

  return prisma.tournamentPlayer.delete({
    where: { id: pId },
  });
}
