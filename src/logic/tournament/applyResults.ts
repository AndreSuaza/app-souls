import {
  TournamentRoundForProcessing,
  TournamentPlayerForSwiss,
} from "@/interfaces";

export function applySwissResults(
  round: TournamentRoundForProcessing,
  players: TournamentPlayerForSwiss[]
) {
  const updates: {
    id: string;
    points: number;
    rivals: string[];
    hadBye?: boolean;
  }[] = [];

  for (const match of round.matches) {
    const p1 = players.find((p) => p.id === match.player1Id);
    const p2 = players.find((p) => p.id === match.player2Id);

    if (!p1) continue;

    // BYE
    if (!match.player2Id || match.player2Nickname === "BYE") {
      updates.push({
        id: p1.id,
        points: p1.points + 3,
        rivals: [...p1.rivals],
        hadBye: true,
      });
      continue;
    }

    if (!p2) continue;

    // Ambos agregan rival
    p1.rivals.push(p2.id);
    p2.rivals.push(p1.id);

    // Resultado
    if (match.result === "P1") {
      p1.points += 3;
    } else if (match.result === "P2") {
      p2.points += 3;
    } else if (match.result === "DRAW") {
      p1.points += 1;
      p2.points += 1;
    }
  }

  return players; // con puntos y rivales actualizados
}
