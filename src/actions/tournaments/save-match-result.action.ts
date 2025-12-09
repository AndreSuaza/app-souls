"use server";

import { prisma } from "@/lib/prisma";

type SaveMatchResultParams = {
  matchId: string;
  result: "P1" | "P2" | "DRAW";
};

export async function saveMatchResult({
  matchId,
  result,
}: SaveMatchResultParams) {
  // Obtener solo lo necesario del match
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      player1Id: true,
      player2Id: true,
      round: {
        select: { status: true },
      },
    },
  });

  if (!match) throw new Error("El match no existe");

  // Validaciones ligeras
  if (match.player2Id === null) {
    throw new Error("Los matches con BYE no pueden modificarse.");
  }

  if (match.round?.status === "finished") {
    throw new Error("La ronda ya está finalizada");
  }

  // Calcular scores
  let player1Score = 0;
  let player2Score = 0;

  if (result === "P1") {
    player1Score = 3;
  } else if (result === "P2") {
    player2Score = 3;
  } else if (result === "DRAW") {
    player1Score = 1;
    player2Score = 1;
  }

  // Actualizar match y retornar solo lo necesario
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      result,
      player1Score,
      player2Score,
      status: "in_progress",
    },
    select: {
      id: true,
      player1Id: true,
      player2Id: true,
      result: true,
      status: true,
    },
  });

  return updatedMatch;
}
