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

    const result = await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({
        where: { id: data.tournamentId },
        select: {
          id: true,
          status: true,
          maxRounds: true,
        },
      });

      if (!tournament) {
        throw new Error("El torneo no existe");
      }

      const exists = await tx.tournamentPlayer.findFirst({
        where: {
          tournamentId: data.tournamentId,
          userId: data.userId,
        },
        select: { id: true },
      });

      if (exists) {
        throw new Error("El jugador ya esta registrado en este torneo");
      }

      const player = await tx.tournamentPlayer.create({
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

      const playersCount = await tx.tournamentPlayer.count({
        where: { tournamentId: data.tournamentId },
      });

      const recalculatedMaxRounds =
        playersCount > 3 ? Math.ceil(Math.log2(playersCount)) : 1;
      const nextMaxRounds =
        tournament.status === "in_progress"
          ? Math.max(tournament.maxRounds, recalculatedMaxRounds)
          : tournament.maxRounds;

      // Al entrar jugadores tarde, el torneo puede necesitar una ronda adicional.
      if (nextMaxRounds !== tournament.maxRounds) {
        await tx.tournament.update({
          where: { id: data.tournamentId },
          data: { maxRounds: nextMaxRounds },
        });
      }

      return {
        id: player.id,
        maxRounds: nextMaxRounds,
      };
    });

    return result;
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[addPlayerAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error agregando el jugador al torneo",
    );
  }
}
