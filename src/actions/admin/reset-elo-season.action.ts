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
    select: { id: true, eloPoints: true, matchesPlayed: true },
  });

  if (players.length === 0) {
    return { ok: true, seasonNumber: nextSeason, updatedUsers: 0 };
  }

  const now = new Date();
  const playerIds = players.map((player) => player.id);
  const historyData = players.map((player) => {
    const eloPoints = player.eloPoints ?? 0;
    const matchesPlayed = player.matchesPlayed ?? 0;
    // Guardamos el winrate calculado con la misma fórmula usada en el perfil.
    const winrateRaw = matchesPlayed > 0 ? (eloPoints / matchesPlayed) * 100 : 0;
    const winrate = Math.min(100, Math.max(0, Math.round(winrateRaw)));

    return {
      userId: player.id,
      eloPoints,
      matchesPlayed,
      winrate,
      seasonNumber: nextSeason,
      createdAt: now,
    };
  });

  // Usamos los IDs encontrados para asegurar que se reinician los mismos jugadores historizados.
  const [, updatedPlayers] = await prisma.$transaction([
    prisma.eloSeasonHistory.createMany({ data: historyData }),
    prisma.user.updateMany({
      where: { id: { in: playerIds } },
      data: { eloPoints: 0, matchesPlayed: 0 },
    }),
  ]);

  return {
    ok: true,
    seasonNumber: nextSeason,
    updatedUsers: updatedPlayers.count,
  };
};
