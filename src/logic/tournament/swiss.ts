import { SwissMatch, SwissRound } from "./types";
import { TournamentPlayerInterface } from "@/interfaces";

/**
 * Clona jugadores para manipular sin mutar los originales.
 */
function clonePlayers(
  players: TournamentPlayerInterface[]
): TournamentPlayerInterface[] {
  return players.map((p) => ({
    ...p,
    rivals: [...p.rivals],
    hadBye: !!p.hadBye,
  }));
}

/**
 * Evita emparejar jugadores que ya fueron rivales.
 */
function alreadyPlayed(
  a: TournamentPlayerInterface,
  b: TournamentPlayerInterface
) {
  return a.rivals.includes(b.id) || b.rivals.includes(a.id);
}

/**
 * Intenta generar emparejamientos estilo suizo sin repetir rivales.

 * Función equivalente a swissPairingNoRepeat() → tryPair().
    *
    * - Empieza con el jugador de mayor puntuación (pool[0])
    * - Busca un rival con la menor diferencia de puntos
    * - Verifica que NO hayan jugado antes
    * - Elimina ambos del pool
    * - Llama recursivamente para emparejar el resto
    * - Si falla, backtracking para probar otras combinaciones
    *
    * Si no encuentra emparejamiento válido, retorna null.
 */
function tryPair(pool: TournamentPlayerInterface[]): SwissMatch[] | null {
  if (pool.length === 0) return [];

  const first = pool[0];

  // Candidatos ordenados por cercanía en puntos
  const candidates = pool.slice(1).sort((a, b) => {
    const diffA = Math.abs(a.points - first.points);
    const diffB = Math.abs(b.points - first.points);

    if (diffA !== diffB) return diffA - diffB;

    // desempate secundario
    return b.points - a.points;
  });

  for (const candidate of candidates) {
    // Evitar repetir rival
    if (alreadyPlayed(first, candidate)) continue;

    // Remover a los dos jugadores del pool
    const remaining = pool.filter(
      (p) => p.id !== first.id && p.id !== candidate.id
    );

    // Intentar emparejar el resto (recursivo)
    const rest = tryPair(remaining);

    if (rest !== null) {
      return [{ player1: first, player2: candidate }, ...rest];
    }
  }

  // No se encontró emparejamiento válido: backtracking falla
  return null;
}

/**
 * Manejo de BYE:
 * 1. Si número de jugadores es impar → hay BYE
 * 2. Se asigna el jugador con MENOS puntos
 * 3. Preferir quien NO haya recibido BYE antes
 * 4. Ese jugador se remueve del pool para emparejar el resto
 *
 * player2 = null representa BYE (equivalente a tu {name:"BYE"})
 */
function assignBye(players: TournamentPlayerInterface[]): {
  updatedPlayers: TournamentPlayerInterface[];
  byeMatch: SwissMatch | null;
} {
  if (players.length % 2 === 0) {
    return { updatedPlayers: players, byeMatch: null };
  }

  // Orden ascendente por puntos
  const sorted = [...players].sort((a, b) => a.points - b.points);

  // Preferir jugador sin BYE, si no, el de menor puntaje
  let byePlayer = sorted.find((p) => !p.hadBye) ?? sorted[0];

  byePlayer.hadBye = true;

  const remaining = players.filter((p) => p.id !== byePlayer.id);

  return {
    updatedPlayers: remaining,
    byeMatch: {
      player1: byePlayer,
      player2: null,
    },
  };
}

/**
 * Mezcla aleatoria (idéntico a shuffleArray original)
 */
function shufflePlayers(
  players: TournamentPlayerInterface[]
): TournamentPlayerInterface[] {
  const arr = [...players]; // no mutar original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // índice aleatorio
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
  }
  return arr;
}

/**
 * FUNCIÓN PRINCIPAL DEL BACKEND
 * Genera una ronda Swiss real desde los datos de BD.
 * Cambia "name" por "id" para trabajar con BD (sin romper la lógica)
 */
export function generateSwissRoundBackend(
  dbPlayers: TournamentPlayerInterface[],
  dbCurrentRounds: number
): SwissRound {
  /**
   * Convertimos los jugadores de Prisma a SwissPlayer
   * y luego CLONAMOS profundamente (igual que en deepClonePlayers original)
   * para no modificar las referencias de la BD en memoria.
   */
  let players: TournamentPlayerInterface[] = clonePlayers(dbPlayers);
  /**
   * PRIMERA RONDA: mezcla aleatoria
   */
  if (dbCurrentRounds === 0) {
    players = shufflePlayers(players);
  } else {
    // Rondas siguientes: ordenar por puntos (Swiss estándar)
    players.sort((a, b) => b.points - a.points);
  }

  // Asignación de BYE (misma lógica)
  const { updatedPlayers, byeMatch } = assignBye(players);
  players = updatedPlayers;

  // Emparejamiento principal Swiss
  const matches = tryPair(players) || [];

  // Combinar BYE + matches
  const finalMatches = byeMatch ? [byeMatch, ...matches] : matches;

  return {
    number: dbCurrentRounds + 1,
    matches: finalMatches,
  };
}
