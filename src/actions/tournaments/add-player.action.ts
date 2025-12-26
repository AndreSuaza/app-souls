"use server";

import { prisma } from "@/lib/prisma";
import { TournamentPlayerSchema, TournamentPlayerInput } from "@/schemas";

export async function addPlayerAction(input: TournamentPlayerInput) {
  try {
    const data = TournamentPlayerSchema.parse(input);

    const exists = await prisma.tournamentPlayer.findFirst({
      where: {
        tournamentId: data.tournamentId,
        userId: data.userId,
      },
      select: { id: true },
    });

    if (exists) {
      throw new Error("El jugador ya está registrado en este torneo");
    }

    const hasActiveTournament = await prisma.tournamentPlayer.findFirst({
      where: {
        userId: data.userId,
        tournament: {
          status: {
            in: ["pending", "in_progress"],
          },
        },
      },
      select: { id: true },
    });

    if (hasActiveTournament) {
      throw new Error(
        "El jugador ya está registrado en un torneo pendiente o en progreso"
      );
    }

    const player = await prisma.tournamentPlayer.create({
      data: {
        tournamentId: data.tournamentId,
        playerNickname: data.playerNickname,
        name: data.name,
        lastname: data.lastname,
        image: data.image,
        userId: data.userId,
        points: data.pointsInitial ?? 0,
        pointsInitial: data.pointsInitial ?? 0,
      },
      select: {
        id: true,
      },
    });

    return player;
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[addPlayerAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error agregando el jugador al torneo"
    );
  }
}
