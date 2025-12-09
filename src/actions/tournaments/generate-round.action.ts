"use server";

import { prisma } from "@/lib/prisma";
import { generateSwissRoundBackend } from "@/logic";

export async function generateRound(tournamentId: string) {
  // Obtener solo lo necesario
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: {
      id: true,
      maxRounds: true,

      tournamentPlayers: {
        select: {
          id: true,
          playerNickname: true,
          points: true,
          rivals: true,
          hadBye: true,
        },
      },
      tournamentRounds: {
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
            },
          },
        },
      },
    },
  });

  if (!tournament) throw new Error("Torneo no encontrado");

  const players = tournament.tournamentPlayers;
  if (players.length === 0) {
    throw new Error("No hay jugadores inscritos");
  }

  // Calcular maxRounds automáticamente solo en ronda 1
  let maxRounds = tournament.maxRounds;
  const currentRounds = tournament.tournamentRounds.length;

  if (currentRounds === 0) {
    // fórmula Swiss estándar
    maxRounds = players.length > 3 ? Math.ceil(Math.log2(players.length)) : 1;

    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        maxRounds,
        status: "in_progress",
      },
    });
  }

  if (currentRounds >= maxRounds) {
    throw new Error("Ya se alcanzó el número máximo de rondas");
  }

  // Generar emparejamientos Swiss usando lógica externa
  const swissRound = generateSwissRoundBackend(
    players,
    tournament.tournamentRounds
  );

  // Crear ronda y matches
  const createdRound = await prisma.round.create({
    data: {
      tournamentId,
      roundNumber: swissRound.number,
      matches: {
        create: swissRound.matches.map((m) => {
          const isBye = !m.player2;

          return {
            player1Id: m.player1.id,
            player1Nickname: m.player1.nickname,
            player2Id: isBye ? null : m.player2!.id,
            player2Nickname: isBye ? "BYE" : m.player2!.nickname,

            result: isBye ? "P1" : null,
            status: isBye ? "finished" : "pending",

            player1Score: isBye ? 3 : 0,
            player2Score: isBye ? 0 : 0,
          };
        }),
      },
    },
    select: {
      id: true,
      roundNumber: true,
      status: true,
      matches: {
        select: {
          id: true,
          player1Id: true,
          player2Id: true,
          result: true,
          status: true,
        },
      },
    },
  });

  return createdRound;
}
