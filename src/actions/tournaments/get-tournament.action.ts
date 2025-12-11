"use server";

import { prisma } from "@/lib/prisma";
import { IdSchema } from "@/schemas";

export async function getTournamentAction(tournamentId: string) {
  const id = IdSchema.parse(tournamentId);

  const tournament = await prisma.tournament.findUnique({
    include: {
      tournamentPlayers: true,
      tournamentRounds: {
        include: {
          matches: true,
        },
      },
    },
    where: {
      id,
    },
  });

  return tournament;
}
