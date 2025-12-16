"use server";

import { prisma } from "@/lib/prisma";
import { generateSwissRoundBackend } from "@/logic";
import { TournamentPlayerInterface } from "@/interfaces";

type GenerateRoundInput = {
  tournamentId: string;
  players: TournamentPlayerInterface[];
  currentRoundNumber: number;
  maxRounds: number;
  startedAt: Date;
};

export async function generateRoundAction(input: GenerateRoundInput) {
  const { tournamentId, players, currentRoundNumber, maxRounds, startedAt } =
    input;

  // validar jugadores
  if (players.length === 0) {
    throw new Error("No hay jugadores inscritos");
  }

  // calcular nuevas rondas si es primera
  let finalMaxRounds = maxRounds;

  if (currentRoundNumber === 0) {
    finalMaxRounds =
      players.length > 3 ? Math.ceil(Math.log2(players.length)) : 1;

    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        maxRounds: finalMaxRounds,
        status: "in_progress",
        startedAt: startedAt,
      },
    });
  }

  if (currentRoundNumber >= finalMaxRounds) {
    throw new Error("Ya se alcanzó el número máximo de rondas");
  }

  // generar pairing suizo
  const swissRound = generateSwissRoundBackend(players, currentRoundNumber);

  // guardar ronda
  const createdRound = await prisma.round.create({
    data: {
      tournamentId,
      roundNumber: swissRound.number,
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
    select: {
      id: true,
      matches: { select: { id: true } },
    },
  });

  return {
    roundId: createdRound.id,
    matchIds: createdRound.matches.map((m) => m.id),
    swissRound,
    maxRounds: finalMaxRounds,
  };
}
