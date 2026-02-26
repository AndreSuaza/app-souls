"use server";

import { prisma } from "@/lib/prisma";

type PublicTournamentStatus = "pending" | "in_progress" | "finished";

export const getPublicTournaments = async () => {
  try {
    // Separamos: banner con Tier 1, tabla principal con Tier 3 y resumen Tier 1/2.
    const [heroTournament, tournaments, tierTournaments, topPlayers] =
      await Promise.all([
      prisma.tournament.findFirst({
        where: {
          typeTournament: {
            name: "Tier 1",
          },
        },
        select: {
          id: true,
          title: true,
          date: true,
          status: true,
        },
        orderBy: {
          date: "desc",
        },
      }),
      prisma.tournament.findMany({
        where: {
          status: {
            in: ["in_progress", "pending", "finished"],
          },
          typeTournament: {
            name: "Tier 3",
          },
        },
        select: {
          id: true,
          title: true,
          date: true,
          status: true,
          store: {
            select: {
              name: true,
              address: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      }),
      prisma.tournament.findMany({
        where: {
          status: {
            in: ["in_progress", "pending", "finished"],
          },
          typeTournament: {
            name: {
              in: ["Tier 1", "Tier 2"],
            },
          },
        },
        select: {
          id: true,
          title: true,
          date: true,
          status: true,
          store: {
            select: {
              name: true,
              address: true,
            },
          },
          typeTournament: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      }),
      prisma.user.findMany({
        where: {
          role: "player",
        },
        orderBy: {
          eloPoints: "desc",
        },
        take: 6,
        select: {
          id: true,
          nickname: true,
          name: true,
          lastname: true,
          image: true,
          eloPoints: true,
          matchesPlayed: true,
        },
      }),
    ]);

    const orderByStatus = <T extends { status: string; date: Date }>(
      items: T[],
    ) => {
      return [...items].sort((a, b) => {
        const weight = (status: PublicTournamentStatus) => {
          if (status === "in_progress") return 0;
          if (status === "pending") return 1;
          return 2;
        };
        const weightA = weight(a.status as PublicTournamentStatus);
        const weightB = weight(b.status as PublicTournamentStatus);

        if (weightA !== weightB) return weightA - weightB;
        return b.date.getTime() - a.date.getTime();
      });
    };

    const normalized = orderByStatus(tournaments).map((tournament) => ({
      ...tournament,
      status: tournament.status as PublicTournamentStatus,
    }));

    const normalizedTier = orderByStatus(tierTournaments).map((tournament) => ({
      ...tournament,
      status: tournament.status as PublicTournamentStatus,
    }));

    const topPlayersNormalized = topPlayers.map((player) => {
      const matches = player.matchesPlayed ?? 0;
      const elo = player.eloPoints ?? 0;
      // Por requerimiento, el winrate se calcula como eloPoints / matchesPlayed.
      const winrateRaw = matches > 0 ? (elo / matches) * 100 : 0;
      const winrate = Math.min(100, Math.max(0, Math.round(winrateRaw)));

      return {
        id: player.id,
        nickname: player.nickname,
        name: player.name ?? "",
        lastname: player.lastname ?? "",
        image: player.image ?? "player",
        eloPoints: player.eloPoints ?? 0,
        winrate,
      };
    });

    return {
      tournaments: normalized,
      heroTournament: heroTournament
        ? {
            ...heroTournament,
            status: heroTournament.status as PublicTournamentStatus,
          }
        : null,
      tierTournaments: normalizedTier.map((tournament) => ({
        ...tournament,
        tierName: tournament.typeTournament?.name ?? null,
      })),
      topPlayers: topPlayersNormalized,
    };
  } catch (error) {
    throw new Error(`No se pudo cargar los torneos ${error}`);
  }
};
