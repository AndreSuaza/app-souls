"use server";

import { prisma } from "@/lib/prisma";
import { TournamentPlayerSchema } from "@/schemas";

export async function addPlayer_action(input: unknown) {
  const data = TournamentPlayerSchema.parse(input);

  const exists = await prisma.tournamentPlayer.findFirst({
    where: {
      tournamentId: data.tournamentId,
      userId: data.userId,
    },
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
  });

  return player;
}
