"use server";

import { prisma } from "@/lib/prisma";
import type { PublicPlayerRankingItem } from "@/interfaces";

export const getPublicPlayerRankingAction = async (): Promise<
  PublicPlayerRankingItem[]
> => {
  const players = await prisma.user.findMany({
    where: {
      role: "player",
      status: "active",
    },
    orderBy: [{ eloPoints: "desc" }, { nickname: "asc" }],
    take: 100,
    select: {
      id: true,
      nickname: true,
      name: true,
      lastname: true,
      image: true,
      city: true,
      eloPoints: true,
      matchesPlayed: true,
      tournamentsPlayed: true,
      store: {
        select: {
          name: true,
        },
      },
    },
  });

  return players.map((player, index) => {
    const matchesPlayed = player.matchesPlayed ?? 0;
    const victories = player.eloPoints ?? 0;
    const winrateRaw =
      matchesPlayed > 0 ? (victories / matchesPlayed) * 100 : 0;

    return {
      id: player.id,
      rank: index + 1,
      nickname: player.nickname,
      name: player.name ?? "",
      lastname: player.lastname ?? "",
      image: player.image ?? "player",
      city: player.city ?? null,
      storeName: player.store?.name ?? null,
      eloPoints: victories,
      matchesPlayed,
      tournamentsPlayed: player.tournamentsPlayed ?? 0,
      winrate: Math.min(100, Math.max(0, Math.round(winrateRaw))),
    };
  });
};
