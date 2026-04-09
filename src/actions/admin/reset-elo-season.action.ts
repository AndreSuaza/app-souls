"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResetEloSeasonSchema, type ResetEloSeasonInput } from "@/schemas";

type ResetEloSeasonResult = {
  ok: boolean;
  seasonNumber: number;
  updatedUsers: number;
};

export const resetEloSeasonAction = async (
  input: ResetEloSeasonInput = {},
): Promise<ResetEloSeasonResult> => {
  const parsed = ResetEloSeasonSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, seasonNumber: 0, updatedUsers: 0 };
  }

  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("No autorizado para reiniciar Elo.");
  }

  const lastSeason = await prisma.eloSeasonHistory.findFirst({
    orderBy: { seasonNumber: "desc" },
    select: { seasonNumber: true },
  });

  const nextSeason = (lastSeason?.seasonNumber ?? 0) + 1;

  const players = await prisma.user.findMany({
    where: { role: "player" },
    select: { id: true, eloPoints: true },
  });

  if (players.length === 0) {
    return { ok: true, seasonNumber: nextSeason, updatedUsers: 0 };
  }

  const now = new Date();
  const playerIds = players.map((player) => player.id);
  const historyData = players.map((player) => ({
    userId: player.id,
    eloPoints: player.eloPoints ?? 0,
    seasonNumber: nextSeason,
    createdAt: now,
  }));

  // Usamos los IDs encontrados para asegurar que se reinician los mismos jugadores historizados.
  const [, updatedPlayers] = await prisma.$transaction([
    prisma.eloSeasonHistory.createMany({ data: historyData }),
    prisma.user.updateMany({
      where: { id: { in: playerIds } },
      data: { eloPoints: 0 },
    }),
  ]);

  return {
    ok: true,
    seasonNumber: nextSeason,
    updatedUsers: updatedPlayers.count,
  };
};
