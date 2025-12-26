"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const getActiveTournament = async () => {
  const session = await auth();

  if (!session?.user.idd) {
    throw new Error("Error en la sesion");
  }

  try {
    // Buscar el torneo activo (pending / in_progress) mas reciente del usuario.
    const tournamentPlayer = await prisma.tournamentPlayer.findFirst({
      where: {
        userId: session.user.idd,
        tournament: {
          status: {
            in: ["pending", "in_progress"],
          },
        },
      },
      select: {
        tournament: {
          select: {
            id: true,
            title: true,
            status: true,
            currentRoundNumber: true,
            tournamentPlayers: true,
            tournamentRounds: {
              include: {
                matches: true,
              },
              orderBy: {
                roundNumber: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createDate: "desc",
      },
    });

    if (!tournamentPlayer) return null;

    const tournament = tournamentPlayer.tournament;

    // Normalizar la salida para consumo directo en el perfil.
    return {
      currentUserId: session.user.idd,
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
        pointsInitial: player.pointsInitial,
        hadBye: player.hadBye,
        buchholz: player.buchholz,
        rivals: player.rivals,
      })),
      rounds: tournament.tournamentRounds.map((round) => ({
        id: round.id,
        roundNumber: round.roundNumber,
        startedAt: round.startedAt ? round.startedAt.toISOString() : null,
        matches: round.matches.map((match) => ({
          id: match.id,
          player1Id: match.player1Id,
          player2Id: match.player2Id,
          player1Nickname: match.player1Nickname,
          player2Nickname: match.player2Nickname,
          result: match.result,
        })),
      })),
    };
  } catch (error) {
    throw new Error(`Error en la sesion ${error}`);
  }
};
