"use server";

import { prisma } from "@/lib/prisma";
import { IdSchema } from "@/schemas";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getTournamentAction(tournamentId: string) {
  const id = IdSchema.parse(tournamentId);

  const session = await auth();

  // Validar sesión para poder mostrar el torneo
  if (!session?.user) {
    throw new Error("No autorizado");
  }

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

  if (!tournament) {
    throw new Error("Torneo no encontrado");
  }

  // Si el user tiene role store, validar si el torneo le pertenece
  if (session.user.role === "store") {
    if (!session.user.storeId || tournament.storeId !== session.user.storeId) {
      redirect("/administrador/torneos");
    }
  }

  return tournament;
}
