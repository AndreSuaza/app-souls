"use server";

import { prisma } from "@/lib/prisma";

export async function deletePlayer(playerId: string) {
  await prisma.tournamentPlayer.delete({
    where: { id: playerId },
  });

  return { id: playerId };
}
