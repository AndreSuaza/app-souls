"use server";

import { prisma } from "@/lib/prisma";

export async function getTournamentTypesAction() {
  try {
    return prisma.typeTournament.findMany({
      orderBy: { createDate: "asc" },
    });
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[getTournamentTypesAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error al traer los tipos de torneos"
    );
  }
}
