// Cálculo de Buchholz para jugadores Swiss.
// Suma de los puntos de todos los rivales registrados.
// Esta función se usa tanto al finalizar rondas como al finalizar el torneo.
export function calculateBuchholzForPlayers(
  players: {
    id: string;
    points: number;
    rivals: string[];
  }[]
) {
  return players.map((p) => {
    const buchholz = p.rivals
      .map((r) => players.find((x) => x.id === r)?.points || 0)
      .reduce((a, b) => a + b, 0);

    return { ...p, buchholz };
  });
}
