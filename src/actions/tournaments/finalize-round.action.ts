"use server";

import { prisma } from "@/lib/prisma";
import { RoundInterface, TournamentPlayerInterface } from "@/interfaces";

export async function finalizeRoundAction(
  tournamentId: string,
  round: RoundInterface,
  players: TournamentPlayerInterface[]
) {
  if (!round) throw new Error("Ronda no encontrada");

  // Validar que no hayan matches pendientes
  if (round.matches.some((m) => m.result === null)) {
    throw new Error(
      "No puedes finalizar la ronda: hay partidas sin resultado."
    );
  }

  // Guardar todos los cambios en BD
  await prisma.$transaction(
    players.map((p) =>
      prisma.tournamentPlayer.update({
        where: { id: p.id },
        data: {
          points: p.points,
          rivals: p.rivals,
          hadBye: p.hadBye,
          buchholz: p.buchholz,
        },
      })
    )
  );

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { currentRoundNumber: { increment: 1 } },
  });
}
