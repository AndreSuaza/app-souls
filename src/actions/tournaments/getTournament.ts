"use server";

import { prisma } from "@/lib/prisma";
import { IdSchema } from "@/schemas";
import { TournamentDetail } from "@/interfaces";

export async function getTournament_action(tournamentId: string) {
  const id = IdSchema.parse(tournamentId);

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      descripcion: true,
      url: true,
      lat: true,
      lgn: true,
      format: true,
      date: true,
      image: true,
      status: true,
      currentRoundNumber: true,
      maxRounds: true,
      finalRankingIds: true,
      createDate: true,
      storeId: true,
      typeTournamentId: true,

      tournamentPlayers: {
        select: {
          id: true,
          userId: true,
          playerNickname: true,
          points: true,
          rivals: true,
          hadBye: true,
          finalRanking: true,
          pointsInitial: true,
          buchholz: true,
        },
      },

      tournamentRounds: {
        select: {
          id: true,
          roundNumber: true,
          status: true,
          matches: {
            select: {
              id: true,
              player1Id: true,
              player1Nickname: true,
              player2Id: true,
              player2Nickname: true,
              result: true,
              status: true,
              player1Score: true,
              player2Score: true,
            },
          },
        },
      },
    },
  });

  return tournament as TournamentDetail;
}
