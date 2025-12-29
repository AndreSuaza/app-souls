"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileTournamentSchema } from "@/schemas";

type Input = {
  tournamentId: string;
};

export const getProfileTournament = async (input: Input) => {
  const session = await auth();

  if (!session?.user.idd) {
    throw new Error("Error en la sesion");
  }

  const parsed = ProfileTournamentSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  const tournament = await prisma.tournament.findFirst({
    where: {
      id: parsed.data.tournamentId,
      tournamentPlayers: {
        some: {
          userId: session.user.idd,
        },
      },
    },
    select: {
      id: true,
      title: true,
      status: true,
      currentRoundNumber: true,
      tournamentPlayers: {
        select: {
          id: true,
          userId: true,
          playerNickname: true,
          name: true,
          lastname: true,
          image: true,
          points: true,
          buchholz: true,
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
              result: true,
            },
          },
        },
        orderBy: {
          roundNumber: "asc",
        },
      },
    },
  });

  if (!tournament) {
    throw new Error("Torneo no encontrado.");
  }

  // Normaliza el torneo para usarlo directamente en el perfil.
  return {
    tournament: {
      id: tournament.id,
      title: tournament.title,
      status: tournament.status,
      currentRoundNumber: tournament.currentRoundNumber,
    },
    players: tournament.tournamentPlayers.map((player) => ({
      id: player.id,
      userId: player.userId,
      playerNickname: player.playerNickname,
      name: player.name ?? undefined,
      lastname: player.lastname ?? undefined,
      image: player.image ?? undefined,
      points: player.points,
      buchholz: player.buchholz,
      pointsInitial: 0,
      hadBye: false,
      rivals: [],
    })),
    rounds: tournament.tournamentRounds.map((round) => ({
      id: round.id,
      roundNumber: round.roundNumber,
      startedAt: null,
      matches: round.matches.map((match) => ({
        id: match.id,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        player1Nickname: "",
        player2Nickname: null,
        result: match.result,
      })),
    })),
  };
};
