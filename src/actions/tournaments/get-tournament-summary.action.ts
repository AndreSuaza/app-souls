"use server";

import { prisma } from "@/lib/prisma";
import { IdSchema } from "@/schemas";

export async function getTournamentSummaryAction(tournamentId: string) {
  const id = IdSchema.parse(tournamentId);

  try {
    return await prisma.tournament.findUnique({
      select: {
        id: true,
        title: true,
      },
      where: {
        id,
      },
    });
  } catch (error) {
    console.error("[getTournamentSummaryAction]", error);
    throw new Error("Error al consultar el torneo");
  }
}
