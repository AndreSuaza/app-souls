"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const getUserTournaments = async () => {
  const session = await auth();

  if (!session?.user.idd) {
    throw new Error("Error en la sesion");
  }

  try {
    // Obtener todos los torneos donde el usuario esta registrado.
    const tournaments = await prisma.tournament.findMany({
      where: {
        tournamentPlayers: {
          some: {
            userId: session.user.idd,
          },
        },
      },
      select: {
        id: true,
        title: true,
        date: true,
        status: true,
        tournamentPlayers: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Ajustar el shape a la lista de torneos del perfil.
    return tournaments.map((tournament) => ({
      id: tournament.id,
      title: tournament.title,
      date: tournament.date.toISOString(),
      status: tournament.status,
      playersCount: tournament.tournamentPlayers.length,
    }));
  } catch (error) {
    throw new Error(`Error en la sesion ${error}`);
  }
};
