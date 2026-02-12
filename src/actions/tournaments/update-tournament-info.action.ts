"use server";

import { prisma } from "@/lib/prisma";
import {
  UpdateTournamentInfoSchema,
  UpdateTournamentInfoInput,
} from "@/schemas";

export async function updateTournamentInfoAction(
  input: UpdateTournamentInfoInput
) {
  try {
    const data = UpdateTournamentInfoSchema.parse(input);

    if (data.status === "finished") {
      throw new Error("No se puede editar un torneo finalizado");
    }




    await prisma.tournament.update({
      where: { id: data.tournamentId },
      data: {
        title: data.title,
        description: data.description ?? undefined, // evita null
        date: data.date,
      },
    });
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[startRoundAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error ? error.message : "Error al iniciar la ronda"
    );
  }
}
