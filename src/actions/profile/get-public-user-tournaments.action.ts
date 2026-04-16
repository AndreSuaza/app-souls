"use server";

import { prisma } from "@/lib/prisma";
import { PublicUserIdSchema } from "@/schemas";

type PublicUserTournamentsInput = {
  userId: string;
};

export const getPublicUserTournamentsAction = async (
  input: PublicUserTournamentsInput,
) => {
  const parsed = PublicUserIdSchema.safeParse(input);
  if (!parsed.success) {
    return [];
  }

  const tournaments = await prisma.tournament.findMany({
    where: {
      tournamentPlayers: {
        some: {
          userId: parsed.data.userId,
        },
      },
      // Solo muestra torneos finalizados o en progreso en el perfil publico.
      status: {
        in: ["finished", "in_progress"],
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
        },
      },
      _count: {
        select: {
          tournamentPlayers: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return tournaments.map((tournament) => ({
    id: tournament.id,
    title: tournament.title,
    date: tournament.date.toISOString(),
    status: tournament.status,
    playersCount: tournament._count.tournamentPlayers,
    storeName: tournament.store?.name ?? null,
  }));
};
