"use server";

import { prisma } from "@/lib/prisma";

export async function getTournamentTypesAction() {
  return prisma.typeTournament.findMany({
    orderBy: { createDate: "asc" },
  });
}
