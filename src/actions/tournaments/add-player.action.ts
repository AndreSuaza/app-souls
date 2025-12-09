"use server";

import { prisma } from "@/lib/prisma";
import { TournamentPlayerSchema, TournamentPlayerInput } from "@/schemas";

export async function addPlayer(input: TournamentPlayerInput) {
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

  const player = await prisma.tournamentPlayer.create({
    data: {
      tournamentId: data.tournamentId,
      playerNickname: data.nickname,
      userId: data.userId,
      points: data.pointsInitial ?? 0,
      pointsInitial: data.pointsInitial ?? 0,
    },
    select: {
      id: true,
      userId: true,
      playerNickname: true,
      points: true,
      buchholz: true,
    },
  });

  return player;
}
