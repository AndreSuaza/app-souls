"use server";

import { prisma } from "@/lib/prisma";
import { SaveMatchSchema } from "@/schemas";

export async function saveMatchResult_action(input: unknown) {
  const data = SaveMatchSchema.parse(input);

  const match = await prisma.match.findUnique({
    where: { id: data.matchId },
    include: { round: true },
  });

  if (!match) {
    throw new Error("El match no existe");
  }

  // validar existencia de la ronda relacionada
  if (!match.round) {
    throw new Error("La ronda asociada al match no existe");
  }

  // bloquear modificación de matches con BYE
  if (match.player2Nickname === "BYE") {
    throw new Error("Los matches con BYE no pueden modificarse.");
  }

  // bloquear modificación si la ronda ya se cerró
  if (match.round.status === "finished") {
    throw new Error("La ronda ya está finalizada");
  }

  let player1Score = 0;
  let player2Score = 0;

  if (data.result === "P1") {
    player1Score = 3;
    player2Score = 0;
  } else if (data.result === "P2") {
    player1Score = 0;
    player2Score = 3;
  } else if (data.result === "DRAW") {
    player1Score = 1;
    player2Score = 1;
  }

  const updatedMatch = await prisma.match.update({
    where: { id: data.matchId },
    data: {
      result: data.result,
      player1Score,
      player2Score,
      status: "in_progress",
    },
    include: {
      round: {
        include: { matches: true },
      },
    },
  });

  return updatedMatch;
}
