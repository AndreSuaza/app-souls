"use server";

import { prisma } from "@/lib/prisma";

export async function finalizeTournament(tournamentId: string) {
  // Obtener jugadores del torneo
  const players = await prisma.tournamentPlayer.findMany({
    where: { tournamentId },
    select: {
      id: true,
      points: true,
      buchholz: true,
      rivals: true,
    },
  });

  // Ordenar standings por puntos y buchholz
  const standings = players.sort(
    (a, b) => b.points - a.points || b.buchholz - a.buchholz
  );

  // Preparar ranking final
  const finalRankingUpdates = standings.map((p, index) => ({
    id: p.id,
    finalRanking: index + 1,
  }));

  // Guardar finalRanking en cada jugador
  for (const item of finalRankingUpdates) {
    await prisma.tournamentPlayer.update({
      where: { id: item.id },
      data: { finalRanking: item.finalRanking },
    });
  }

  // Guardar finalRankingIds en el torneo y marcar status = finished
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      finalRankingIds: finalRankingUpdates.map((p) => p.id),
      status: "finished",
    },
  });

  // Retornar solo lo que el STORE necesita
  return {
    tournamentId,
    status: "finished",
  };
}
