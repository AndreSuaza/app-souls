import { TournamentPlayerInterface } from "@/interfaces";

// Ordena los jugadores por criterio de ranking
export const sortPlayersByRanking = (
  players: TournamentPlayerInterface[]
): TournamentPlayerInterface[] => {
  return [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.buchholz - a.buchholz;
  });
};

export const getRecordPlaceholder = (): string => {
  // Placeholder hasta que se implemente W-D-L real
  return "-";
};
