"use server";

import { prisma } from "@/lib/prisma";
import { MatchInterface, TournamentPlayerInterface } from "@/interfaces";

type EditRoundResultsInput = {
  matches: MatchInterface[];
  players: TournamentPlayerInterface[];
};

export const editRoundResultsAction = async ({
  matches,
  players,
}: EditRoundResultsInput): Promise<void> => {
  try {
    await prisma.$transaction(async (tx) => {
      // Actualizar resultados de los matchs
      for (const match of matches) {
        if (match.player2Id === null) continue;

        await tx.match.update({
          where: { id: match.id },
          data: {
            result: match.result,
          },
        });
      }

      // Actualizar puntos de los jugadores (NO buchholz)
      for (const player of players) {
        await tx.tournamentPlayer.update({
          where: { id: player.id },
          data: {
            points: player.points,
          },
        });
      }
    });
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[editRoundResultAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error al editar el resultado de la ronda"
    );
  }
};
