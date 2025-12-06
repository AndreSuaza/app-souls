"use server";

import { prisma } from "@/lib/prisma";
import { GenerateRoundSchema } from "@/schemas";
import { generateSwissRoundBackend } from "@/modules";

export async function generateRound_action(input: unknown) {
  const data = GenerateRoundSchema.parse(input);

  const tournament = await prisma.tournament.findUnique({
    where: { id: data.tournamentId },
    include: {
      tournamentPlayers: true,
      tournamentRounds: {
        include: { matches: true },
      },
    },
  });

  if (!tournament) throw new Error("Torneo no encontrado");
  if (tournament.tournamentPlayers.length === 0)
    throw new Error("No hay jugadores inscritos");

  const playersCount = tournament.tournamentPlayers.length;

  // Ejecutar el algoritmo Swiss
  const newRound = generateSwissRoundBackend(
    tournament.tournamentPlayers,
    tournament.tournamentRounds
  );

  // Calcular maxRounds automáticamente si es la primera ronda
  let maxRounds = tournament.maxRounds;
  if (tournament.tournamentRounds.length === 0) {
    const autoMaxRounds =
      playersCount > 3 ? Math.ceil(Math.log2(playersCount)) : 1;

    const updatedTournament = await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        maxRounds: autoMaxRounds,
        status: "in_progress",
      },
    });

    maxRounds = updatedTournament.maxRounds;
  }

  if (tournament.tournamentRounds.length >= maxRounds) {
    throw new Error("Ya se alcanzó el número máximo de rondas");
  }

  // Crear la ronda + matches
  const createdRound = await prisma.round.create({
    data: {
      tournamentId: data.tournamentId,
      roundNumber: newRound.number,
      matches: {
        create: newRound.matches.map((m) => {
          const isBye = !m.player2;

          return {
            player1Id: m.player1.id,
            player1Nickname: m.player1.nickname,
            player2Id: isBye ? null : m.player2!.id,
            player2Nickname: isBye ? "BYE" : m.player2!.nickname,

            // BYE → resultado automático
            result: isBye ? "P1" : null,
            status: isBye ? "finished" : "pending",

            player1Score: isBye ? 3 : 0,
            player2Score: isBye ? 0 : 0,
          };
        }),
      },
    },
    include: {
      matches: true,
    },
  });

  // Retornar ronda con matches incluidos
  return createdRound;
}
