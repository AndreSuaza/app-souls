"use server";

import { prisma } from "@/lib/prisma";
import { DeletePlayerSchema } from "@/schemas";

export async function deletePlayerAction(input: {
  playerId: string;
  matchDeleteId?: string | null;
  matchUpdate?: {
    id: string;
    player1Id: string;
    player1Nickname: string;
    player2Id: string | null;
    player2Nickname: string | null;
    result: "P1" | "P2" | "DRAW" | null;
  } | null;
}) {
  try {
    const data = DeletePlayerSchema.parse(input);

    await prisma.$transaction(async (tx) => {
      if (data.matchDeleteId) {
        await tx.match.delete({ where: { id: data.matchDeleteId } });
      } else if (data.matchUpdate) {
        await tx.match.update({
          where: { id: data.matchUpdate.id },
          data: {
            player1Id: data.matchUpdate.player1Id,
            player1Nickname: data.matchUpdate.player1Nickname,
            player2Id: data.matchUpdate.player2Id,
            player2Nickname: data.matchUpdate.player2Nickname,
            result: data.matchUpdate.result,
          },
        });
      }

      await tx.tournamentPlayer.delete({
        where: { id: data.playerId },
      });
    });
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[deletePlayerAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error eliminando el jugador del torneo"
    );
  }
}
