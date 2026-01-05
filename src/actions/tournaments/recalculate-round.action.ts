"use server";

import { prisma } from "@/lib/prisma";
import { generateSwissRoundBackend } from "@/logic";
import { RecalculateRoundSchema, RecalculateRoundInput } from "@/schemas";
import { TournamentPlayerInterface } from "@/interfaces";

export async function recalculateRoundAction(input: RecalculateRoundInput) {
  try {
    const data = RecalculateRoundSchema.parse(input);

    const round = await prisma.round.findFirst({
      where: { id: data.roundId, tournamentId: data.tournamentId },
      select: { id: true, roundNumber: true },
    });

    if (!round) {
      throw new Error("Ronda no encontrada");
    }

    if (round.roundNumber !== data.currentRoundNumber + 1) {
      throw new Error("La ronda no corresponde a la actual");
    }

    // Recalcula emparejamientos con el mismo numero de ronda.
    const swissRound = generateSwissRoundBackend(
      data.players as TournamentPlayerInterface[],
      data.currentRoundNumber
    );

    const matchIds = await prisma.$transaction(async (tx) => {
      await tx.match.deleteMany({
        where: { roundId: data.roundId },
      });

      const updatedRound = await tx.round.update({
        where: { id: data.roundId },
        data: {
          // Reinicia la ronda para que pueda iniciarse nuevamente.
          startedAt: null,
          finishedAt: null,
          matches: {
            create: swissRound.matches.map((m) => {
              const isBye = !m.player2;

              return {
                player1Id: m.player1.id,
                player1Nickname: m.player1.playerNickname,
                player2Id: isBye ? null : m.player2!.id,
                player2Nickname: isBye ? "BYE" : m.player2!.playerNickname,
                result: isBye ? "P1" : null,
              };
            }),
          },
        },
        select: { matches: { select: { id: true } } },
      });

      return updatedRound.matches.map((m) => m.id);
    });

    return {
      roundId: data.roundId,
      matchIds,
      swissRound,
    };
  } catch (error) {
    console.error("[recalculateRoundAction]", error);

    throw new Error(
      error instanceof Error ? error.message : "Error al recalcular la ronda"
    );
  }
}
