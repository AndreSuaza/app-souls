"use server";

import { prisma } from "@/lib/prisma";
import { applySwissResults, calculateBuchholzForPlayers } from "@/logic";

export async function finalizeRound(roundId: string, tournamentId: string) {
  // Obtener ronda con matches
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    select: {
      id: true,
      roundNumber: true,
      matches: {
        select: {
          id: true,
          player1Id: true,
          player2Id: true,
          player1Nickname: true,
          player2Nickname: true,
          result: true,
        },
      },
    },
  });

  if (!round) throw new Error("Ronda no encontrada");

  // Validar que no hayan matches pendientes
  if (round.matches.some((m) => m.result === null)) {
    throw new Error(
      "No puedes finalizar la ronda: hay partidas sin resultado."
    );
  }

  // Obtener jugadores
  const players = await prisma.tournamentPlayer.findMany({
    where: { tournamentId },
  });

  // Aplicar lógica Swiss (ahora en /logic)
  const updatedPlayers = applySwissResults(round, players);

  // Guardar todos los cambios en BD
  for (const p of updatedPlayers) {
    await prisma.tournamentPlayer.update({
      where: { id: p.id },
      data: {
        points: p.points,
        rivals: p.rivals,
        hadBye: p.hadBye,
      },
    });
  }

  // Finalizar ronda
  await prisma.round.update({
    where: { id: roundId },
    data: { status: "finished" },
  });

  await prisma.match.updateMany({
    where: { roundId },
    data: { status: "finished" },
  });

  // Buchholz
  const buchholzPlayers = calculateBuchholzForPlayers(updatedPlayers);

  for (const p of buchholzPlayers) {
    await prisma.tournamentPlayer.update({
      where: { id: p.id },
      data: { buchholz: p.buchholz },
    });
  }

  return {
    roundId,
    status: "finished",
  };
}
