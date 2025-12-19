"use server";

import { prisma } from "@/lib/prisma";
import { IdSchema } from "@/schemas";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getTournamentAction(tournamentId: string) {
  // Validar ID
  const id = IdSchema.parse(tournamentId);

  // Obtener sesión
  const session = await auth();

  if (!session?.user) {
    throw new Error("No autorizado");
  }

  let tournament;

  try {
    // Obtener torneo
    tournament = await prisma.tournament.findUnique({
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
  } catch (error) {
    console.error("[getTournamentAction]", error);
    throw new Error("Error al consultar el torneo");
  }

  if (!tournament) {
    return null;
  }

  // Autorización por tienda
  if (
    session.user.role === "store" &&
    (!session.user.storeId || tournament.storeId !== session.user.storeId)
  ) {
    redirect("/administrador/torneos");
  }

  return tournament;
}
