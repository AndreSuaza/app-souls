"use server";

import { prisma } from "@/lib/prisma";

export async function finalizeTournamentAction(tournamentId: string) {
  if (!tournamentId) throw new Error("Torneo no encontrado");

  // Marcar torneo como finalizado
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: {
      status: "finished",
    },
  });
}
