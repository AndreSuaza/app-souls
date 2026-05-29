"use server";

import { prisma } from "@/lib/prisma";
import { assertCanManageTournament } from "./tournament-action-auth";

type StartRoundInput = {
  roundId: string;
  startedAt: Date;
};

export async function startRoundAction({
  roundId,
  startedAt,
}: StartRoundInput) {
  try {
    if (!roundId) {
      throw new Error("RoundId requerido");
    }

    if (!startedAt) {
      throw new Error("Fecha de inicio requerida");
    }

    const round = await prisma.round.findUnique({
      where: { id: roundId },
      select: { tournamentId: true },
    });

    if (!round) {
      throw new Error("Ronda no encontrada");
    }

    await assertCanManageTournament(round.tournamentId);

    await prisma.round.update({
      where: { id: roundId },
      data: {
        startedAt,
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
