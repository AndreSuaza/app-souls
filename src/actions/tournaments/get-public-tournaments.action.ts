"use server";

import { prisma } from "@/lib/prisma";

type PublicTournamentStatus = "pending" | "in_progress";

export const getPublicTournaments = async () => {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: {
        status: {
          in: ["in_progress", "pending"],
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
    });

    const ordered = [...tournaments].sort((a, b) => {
      const weightA = a.status === "in_progress" ? 0 : 1;
      const weightB = b.status === "in_progress" ? 0 : 1;

      if (weightA !== weightB) return weightA - weightB;
      return b.date.getTime() - a.date.getTime();
    });

    const normalized = ordered.map((tournament) => ({
      ...tournament,
      status: tournament.status as PublicTournamentStatus,
    }));

    return { tournaments: normalized };
  } catch (error) {
    throw new Error(`No se pudo cargar los torneos ${error}`);
  }
};
