"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ManageTournamentSession = {
  user: {
    role?: string | null;
    storeId?: string | null;
  };
};

const assertAdminOrStore = async (): Promise<ManageTournamentSession> => {
  const session = await auth();

  if (!session?.user) {
    throw new Error("No autorizado");
  }

  if (session.user.role !== "admin" && session.user.role !== "store") {
    throw new Error("No autorizado");
  }

  return session;
};

export const assertCanManageTournament = async (tournamentId: string) => {
  const session = await assertAdminOrStore();

  if (session.user.role === "admin") {
    return session;
  }

  if (!session.user.storeId) {
    throw new Error("No autorizado");
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { storeId: true },
  });

  if (!tournament || tournament.storeId !== session.user.storeId) {
    throw new Error("No autorizado");
  }

  return session;
};

export const assertCanCreateTournamentForStore = async (storeId: string) => {
  const session = await assertAdminOrStore();

  if (session.user.role === "store" && session.user.storeId !== storeId) {
    throw new Error("No autorizado");
  }

  return session;
};
