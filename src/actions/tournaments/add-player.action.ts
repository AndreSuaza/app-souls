"use server";

import { prisma } from "@/lib/prisma";
import { TournamentPlayerSchema, TournamentPlayerInput } from "@/schemas";
import { Role } from "@prisma/client";

export async function addPlayerAction(input: TournamentPlayerInput) {
  try {
    const data = TournamentPlayerSchema.parse(input);

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error("El jugador no existe");
    }

    if (user.role !== Role.player) {
      throw new Error("Solo usuarios con rol player pueden registrarse");
    }

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
