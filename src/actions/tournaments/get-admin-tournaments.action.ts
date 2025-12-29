"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AdminTournamentListItem = {
  id: string;
  title: string;
  date: string;
  status: "pending" | "in_progress" | "finished" | "cancelled";
  playersCount: number;
};

export async function getAdminTournamentsAction() {
  try {
    const session = await auth();

    // Solo usuarios autenticados con rol admin o store.
    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "store") {
      return [] as AdminTournamentListItem[];
    }

    // Si es store, filtrar por storeId; si no existe, no hay datos.
    let where;
    if (session.user.role === "store") {
      const storeId = session.user.storeId;
      if (!storeId) {
        return [] as AdminTournamentListItem[];
      }
      where = { storeId };
    }

    const tournaments = await prisma.tournament.findMany({
      where,
      orderBy: { date: "desc" },
      select: {
        id: true,
        title: true,
        date: true,
        status: true,
        // Se usa la relacion para contar jugadores sin consultas extra.
        tournamentPlayers: {
          select: {
            id: true,
          },
        },
      },
    });

    // asigna prioridad a los estados
    const statusPriority: Record<AdminTournamentListItem["status"], number> = {
      in_progress: 0,
      pending: 1,
      finished: 2,
      cancelled: 2,
    };

    const sortedTournaments = [...tournaments].sort((a, b) => {
      const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
      if (priorityDiff !== 0) return priorityDiff;
      return b.date.getTime() - a.date.getTime();
    });

    return sortedTournaments.map((tournament) => ({
      id: tournament.id,
      title: tournament.title,
      date: tournament.date.toISOString(),
      status: tournament.status,
      playersCount: tournament.tournamentPlayers.length,
    }));
  } catch (error) {
    console.error("[getAdminTournamentsAction]", error);
    throw new Error("Error cargando torneos");
  }
}
