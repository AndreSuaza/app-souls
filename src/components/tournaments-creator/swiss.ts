export type Player = {
  name: string;
  points: number;
  rivals: string[];
  hadBye?: boolean; // marcar si ya recibió bye
};

export type Pair = {
  player1: Player,
  player2: Player,
  result?: "P1" | "P2" | "Draw";
}

export type Round = {
  number: number;
  matches: Pair[];
};



function deepClonePlayers(players: Player[]): Player[] {
  return players.map(p => ({ ...p, rivals: [...p.rivals], hadBye: !!p.hadBye }));
}

/**
 * Intenta generar emparejamientos estilo suizo sin repetir rivales.
 * Retorna null si no es posible sin repetir (puedes manejar ese caso).
 */
function swissPairingNoRepeat(origPlayers: Player[]): Pair[] {
  const players = deepClonePlayers(origPlayers).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.name.localeCompare(b.name);
  });

  const pairs: Pair[] = [];

  // Si es impar: seleccionar bye (preferir quien NO haya tenido bye y con menor puntaje)
  if (players.length % 2 === 1) {
    const minPoints = Math.min(...players.map(p => p.points));
    // candidatos con menor puntaje
    const candidates = players.filter(p => p.points === minPoints);
    // preferir uno que NO haya tenido bye
    let byePlayer = candidates.find(p => !p.hadBye) ?? candidates[0];

    // si no hay candidato en el mínimo (caso raro), eligimos el de menor puntaje global
    if (!byePlayer) {
      players.sort((a, b) => a.points - b.points || a.name.localeCompare(b.name));
      byePlayer = players[0];
    }

    // marcar hadBye en la copia
    byePlayer.hadBye = true;
    // remover byePlayer del pool
    const idx = players.findIndex(p => p.name === byePlayer!.name);
    players.splice(idx, 1);
    pairs.push({player1: byePlayer!, player2: {name: "BYE", points: 0, rivals: []}}); // null representa Bye
  }

  // Función auxiliar: revisa si ya jugaron
  const alreadyPlayed = (a: Player, b: Player) =>
    a.rivals.includes(b.name) || b.rivals.includes(a.name);

  // Backtracking: intenta emparejar el array "pool" (ya ordenado por puntos)
  function tryPair(pool: Player[]): Pair[] | null {
    if (pool.length === 0) return [];

    // tomar el primero (mejor puntuado)
    const first = pool[0];

    // Generar lista de candidatos ordenada por cercanía de puntos (preferir igual puntuación)
    const candidates = pool
      .slice(1)
      .sort((x, y) => {
        const dx = Math.abs(x.points - first.points);
        const dy = Math.abs(y.points - first.points);
        if (dx !== dy) return dx - dy;
        // desempate: preferir quien tenga más puntos (para estabilidad)
        if (y.points !== x.points) return y.points - x.points;
        return x.name.localeCompare(x.name);
      });

    for (const cand of candidates) {
      if (alreadyPlayed(first, cand)) continue; // evitar repetición

      // construir nuevo pool (copias superficiales están OK porque no mutamos rivales aquí)
      const newPool = pool.filter(p => p.name !== first.name && p.name !== cand.name);

      // Recursivamente intentar emparejar el resto
      const rest = tryPair(newPool);
      if (rest !== null) {
        // Si success, devolver la pareja + resto
        return [{player1: first, player2: cand}, ...rest];
      }
      // si fail, seguir probando con otro candidato (backtracking)
    }

    // Si no encontramos candidado válido sin repetir -> no hay solución en esta rama
    return null;
  }

  const remainingPairs = tryPair(players);
  if (remainingPairs === null) {
    // No se pudo emparejar sin repetir rivales con las restricciones dadas
    return [];
  }

  return pairs.concat(remainingPairs);
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]; // copiamos para no mutar el original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // índice aleatorio
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // swap
  }
  return newArray;
}

export function generateSwissRound(players: Player[], rounds: Round[]): Round | null {

  let playersS = players;

  if( rounds.length === 0 ) {
    playersS = shuffleArray(players);
  }

 return {
    number: rounds.length + 1,
    matches: swissPairingNoRepeat(playersS),
  };
}