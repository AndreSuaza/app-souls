import { MatchInterface, TournamentPlayerInterface } from "@/interfaces";

export interface RecordWDL {
  wins: number;
  draws: number;
  losses: number;
}

// Ordena los jugadores por criterio de ranking
export const sortPlayersByRanking = (
  players: TournamentPlayerInterface[]
): TournamentPlayerInterface[] => {
  return [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.buchholz - a.buchholz;
  });
};

/**
 * Calcula el record W-D-L de un jugador a partir de las rondas
 */
export const calculatePlayerRecord = (
  playerId: string,
  rounds: { matches: MatchInterface[] }[]
): RecordWDL => {
  let wins = 0;
  let draws = 0;
  let losses = 0;

  rounds.forEach((round) => {
    round.matches.forEach((match) => {
      // Ignorar BYE
      if (!match.player2Id) return;

      if (match.player1Id === playerId) {
        if (match.result === "P1") wins++;
        else if (match.result === "P2") losses++;
        else if (match.result === "DRAW") draws++;
      }

      if (match.player2Id === playerId) {
        if (match.result === "P2") wins++;
        else if (match.result === "P1") losses++;
        else if (match.result === "DRAW") draws++;
      }
    });
  });

  return { wins, draws, losses };
};

/**
 * Devuelve el record en formato texto W-D-L
 */
export const formatRecord = (record: RecordWDL): string => {
  return `${record.wins}-${record.draws}-${record.losses}`;
};
