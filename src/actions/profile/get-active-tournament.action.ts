"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const getActiveTournament = async () => {
  const session = await auth();

  if (!session?.user.idd) {
    throw new Error("Error en la sesion");
  }

  try {
    const playerSelect = {
      id: true,
      userId: true,
      playerNickname: true,
      name: true,
      lastname: true,
      image: true,
      points: true,
      buchholz: true,
    };

    const roundSelect = {
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
    };

    // Cuenta cuantos torneos en progreso tiene registrados el usuario.
    const inProgressCount = await prisma.tournamentPlayer.count({
      where: {
        userId: session.user.idd,
        tournament: {
          status: "in_progress",
        },
      },
    });

    // Selecciona el torneo en progreso mas reciente segun el registro del usuario.
    const currentTournamentPlayer =
      inProgressCount > 0
        ? await prisma.tournamentPlayer.findFirst({
            where: {
              userId: session.user.idd,
              tournament: {
                status: "in_progress",
              },
            },
            select: {
              tournament: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  currentRoundNumber: true,
                  tournamentPlayers: {
                    select: playerSelect,
                  },
                  tournamentRounds: {
                    select: roundSelect,
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
          })
        : null;

    // Solo busca el ultimo torneo si no hay torneos en progreso.
    const lastTournamentPlayer =
      inProgressCount === 0
        ? await prisma.tournamentPlayer.findFirst({
            where: {
              userId: session.user.idd,
              tournament: {
                status: {
                  in: ["pending", "finished"],
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
                  tournamentPlayers: {
                    select: playerSelect,
                  },
                  tournamentRounds: {
                    select: roundSelect,
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
          })
        : null;

    // Normaliza un torneo para reutilizar la misma estructura en el perfil.
    // Se devuelven algunos campos con valores por defecto para mantener el shape esperado en el perfil.
    const mapTournamentDetails = (
      tournament: {
        id: string;
        title: string;
        status: "pending" | "in_progress" | "finished" | "cancelled";
        currentRoundNumber: number;
        tournamentPlayers: Array<{
          id: string;
          userId: string;
          playerNickname: string;
          name: string | null;
          lastname: string | null;
          image: string | null;
          points: number;
          buchholz: number;
        }>;
        tournamentRounds: Array<{
          id: string;
          roundNumber: number;
          matches: Array<{
            id: string;
            player1Id: string;
            player2Id: string | null;
            result: "P1" | "P2" | "DRAW" | null;
          }>;
        }>;
      }
    ) => ({
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
    });

    const lastTournament = lastTournamentPlayer?.tournament
      ? mapTournamentDetails(lastTournamentPlayer.tournament)
      : null;

    const currentTournament = currentTournamentPlayer?.tournament ?? null;

    if (!lastTournament && !currentTournament) return null;

    // Normaliza la respuesta para consumo directo en perfil.
    return {
      currentUserId: session.user.idd,
      inProgressCount,
      lastTournament,
      currentTournament: currentTournament
        ? mapTournamentDetails(currentTournament)
        : null,
    };
  } catch (error) {
    throw new Error(`Error en la sesion ${error}`);
  }
};
