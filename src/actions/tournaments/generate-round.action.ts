"use server";

import { prisma } from "@/lib/prisma";
import { generateSwissRoundBackend } from "@/logic";
import { TournamentPlayerInterface } from "@/interfaces";

type GenerateRoundInput = {
  tournamentId: string;
  players: TournamentPlayerInterface[];
  currentRoundNumber: number;
  maxRounds: number;
};

export async function generateRoundAction(input: GenerateRoundInput) {
  const { tournamentId, players, currentRoundNumber, maxRounds } = input;

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
      startedAt: new Date(),
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
      startedAt: true,
      matches: { select: { id: true } },
    },
  });

  return {
    roundId: createdRound.id,
    startedAt: createdRound.startedAt,
    matchIds: createdRound.matches.map((m) => m.id),
    swissRound,
    maxRounds: finalMaxRounds,
  };
}
