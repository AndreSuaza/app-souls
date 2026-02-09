"use server";

import { prisma } from "@/lib/prisma";

type PublicTournamentStatus = "pending" | "in_progress" | "finished";

export const getPublicTournaments = async () => {
  try {
    // Separamos: banner con Tier 1 y tabla con Tier 3 segun requerimiento.
    const [heroTournament, tournaments] = await Promise.all([
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
    ]);

    const ordered = [...tournaments].sort((a, b) => {
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

    const normalized = ordered.map((tournament) => ({
      ...tournament,
      status: tournament.status as PublicTournamentStatus,
    }));

    return {
      tournaments: normalized,
      heroTournament: heroTournament
        ? {
            ...heroTournament,
            status: heroTournament.status as PublicTournamentStatus,
          }
        : null,
    };
  } catch (error) {
    throw new Error(`No se pudo cargar los torneos ${error}`);
  }
};
