import { RoundInterface, TournamentPlayerInterface } from "@/interfaces";

export function applySwissResults(
  round: RoundInterface,
  players: TournamentPlayerInterface[]
): TournamentPlayerInterface[] {
  // Usamos un Map para acceso O(1)
  const map = new Map(players.map((p) => [p.id, p]));

  for (const match of round.matches) {
    const p1 = match.player1Id ? map.get(match.player1Id) : undefined;
    const p2 = match.player2Id ? map.get(match.player2Id) : undefined;

    if (!p1) continue;

    // Caso BYE: player2 no existe o es "BYE"
    if (!p2 || match.player2Nickname === "BYE") {
      p1.points += 3;
      p1.hadBye = true;
      continue;
    }

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

  // devolvemos el mismo arreglo, ya mutado
  return players;
}
