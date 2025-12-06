"use server";

import { prisma } from "@/lib/prisma";
import { IdSchema } from "@/schemas";
import { calculateBuchholzForPlayers } from "@/modules";

export async function finalizeTournament_action(tournamentId: string) {
  const id = IdSchema.parse(tournamentId);

  const players = await prisma.tournamentPlayer.findMany({
    where: { id },
  });

  const playersWithBuchholz = calculateBuchholzForPlayers(players);

  const standings = playersWithBuchholz.sort(
    (a, b) => b.points - a.points || b.buchholz - a.buchholz
  );

  // asignar finalRanking a cada jugador
  for (let i = 0; i < standings.length; i++) {
    await prisma.tournamentPlayer.update({
      where: { id: String(standings[i].id) },
      data: { finalRanking: i + 1 },
    });
  }

  // guardar finalRankingIds y marcar torneo como finalizado
  const finalRankingIds = standings.map((p) => String(p.id));

  await prisma.tournament.update({
    where: { id: id },
    data: {
      finalRankingIds,
      status: "finished",
    },
  });

  return standings;
}
