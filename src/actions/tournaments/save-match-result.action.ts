"use server";

import { prisma } from "@/lib/prisma";

export async function saveMatchResultAction(
  id: string,
  result: "P1" | "P2" | "DRAW" | null,
  player2Nickname: string | null
) {
  if (!id) throw new Error("El match no existe");

  // Validaciones ligeras
  if (player2Nickname === null || player2Nickname == "BYE") {
    throw new Error("Los matches con BYE no pueden modificarse.");
  }

  // Actualizar match
  await prisma.match.update({
    where: { id },
    data: {
      result,
    },
  });
}
