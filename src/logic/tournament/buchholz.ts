import { TournamentPlayerInterface } from "@/interfaces";

// Cálculo de Buchholz para jugadores Swiss.
// Suma de los puntos de todos los rivales registrados.
// Esta función se usa tanto al finalizar rondas como al finalizar el torneo.
export function calculateBuchholzForPlayers(
  players: TournamentPlayerInterface[]
): TournamentPlayerInterface[] {
  const pointsMap = new Map(players.map((p) => [p.id, p.points]));

  return players.map((p) => ({
    ...p,
    buchholz: p.rivals.reduce(
      (acc, rivalId) => acc + (pointsMap.get(rivalId) ?? 0),
      0
    ),
  }));
}
