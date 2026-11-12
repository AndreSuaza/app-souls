import {
  MatchInterface,
  RoundStage,
  TournamentPlayerInterface,
} from "@/interfaces";
import { sortPlayersByRanking } from "@/utils/ranking";

export type EliminationStage = Extract<
  RoundStage,
  | "ELIMINATION_PLAY_IN"
  | "ELIMINATION_ROUND"
  | "ELIMINATION_ROUND_OF_16"
  | "ELIMINATION_QUARTERFINAL"
  | "ELIMINATION_SEMIFINAL"
  | "ELIMINATION_FINAL"
>;

export type EliminationMatchSeed = {
  player1: TournamentPlayerInterface;
  player2: TournamentPlayerInterface | null;
  bracketPosition: number;
};
export type EliminationPlan = {
  playerCount: number;
  bracketSize: number;
  mainBracketSize: number;
  matchCount: number;
  qualifierMatchCount: number;
  byeCount: number;
  maxRounds: number;
  stage: EliminationStage;
  seededPlayers: TournamentPlayerInterface[];
  matches: EliminationMatchSeed[];
};

const assertPowerOfTwo = (value: number) => {
  if (value < 2 || (value & (value - 1)) !== 0) {
    throw new Error("El tamaño del bracket debe ser una potencia de 2.");
  }
};

export const getNextPowerOfTwo = (value: number) => {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error("La cantidad de jugadores debe ser un entero positivo.");
  }

  let result = 1;
  while (result < value) result *= 2;
  return result;
};

export const getPreviousPowerOfTwo = (value: number) => {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error("La cantidad de jugadores debe ser un entero positivo.");
  }

  let result = 1;
  while (result * 2 <= value) result *= 2;
  return result;
};

export const getEliminationStageForBracketSize = (
  bracketSize: number,
): EliminationStage => {
  assertPowerOfTwo(bracketSize);

  if (bracketSize === 2) return "ELIMINATION_FINAL";
  if (bracketSize === 4) return "ELIMINATION_SEMIFINAL";
  if (bracketSize === 8) return "ELIMINATION_QUARTERFINAL";
  if (bracketSize === 16) return "ELIMINATION_ROUND_OF_16";
  return "ELIMINATION_ROUND";
};

export const getEliminationStageTitle = (
  stage?: RoundStage | null,
  bracketSize?: number | null,
) => {
  if (stage === "ELIMINATION_PLAY_IN") return "Ronda preliminar";
  if (stage === "ELIMINATION_FINAL") return "Final";
  if (stage === "ELIMINATION_SEMIFINAL") return "Semifinal";
  if (stage === "ELIMINATION_QUARTERFINAL") return "Cuartos";
  if (stage === "ELIMINATION_ROUND_OF_16") return "Ronda de 16";

  if (stage === "ELIMINATION_ROUND" && bracketSize) {
    return `Ronda de ${bracketSize}`;
  }

  return "Eliminación directa";
};

export const isEliminationStage = (
  stage?: RoundStage | null,
): stage is EliminationStage =>
  stage === "ELIMINATION_PLAY_IN" ||
  stage === "ELIMINATION_ROUND" ||
  stage === "ELIMINATION_ROUND_OF_16" ||
  stage === "ELIMINATION_QUARTERFINAL" ||
  stage === "ELIMINATION_SEMIFINAL" ||
  stage === "ELIMINATION_FINAL";

/**
 * Devuelve el orden de seeds que ocupa las posiciones de un bracket binario.
 * Para 8 jugadores produce 1,8,4,5,2,7,3,6.
 */
export const getBracketSeedOrder = (bracketSize: number): number[] => {
  assertPowerOfTwo(bracketSize);

  let order = [1, 2];
  for (let size = 4; size <= bracketSize; size *= 2) {
    order = order.flatMap((seed) => [seed, size + 1 - seed]);
  }

  return order;
};

const mapSeedsToMatches = (
  bracketSize: number,
  playersBySeed: Map<number, TournamentPlayerInterface>,
): EliminationMatchSeed[] => {
  const seedOrder = getBracketSeedOrder(bracketSize);
  const matches: EliminationMatchSeed[] = [];

  for (let index = 0; index < seedOrder.length; index += 2) {
    const player1 = playersBySeed.get(seedOrder[index]);
    const player2 = playersBySeed.get(seedOrder[index + 1]);

    if (!player1 && !player2) {
      throw new Error("El bracket no puede contener un enfrentamiento BYE contra BYE.");
    }

    matches.push({
      player1: player1 ?? player2!,
      player2: player1 && player2 ? player2 : null,
      bracketPosition: index / 2 + 1,
    });
  }

  return matches;
};

export const getInitialEliminationPlan = (
  dbPlayers: TournamentPlayerInterface[],
): EliminationPlan => {
  if (dbPlayers.length < 8) {
    throw new Error("Se requieren al menos 8 jugadores para iniciar el bracket.");
  }

  const playerCount = dbPlayers.length;
  const bracketSize = getNextPowerOfTwo(playerCount);
  const mainBracketSize = getPreviousPowerOfTwo(playerCount);
  const qualifierMatchCount = playerCount - mainBracketSize;
  const byeCount = bracketSize - playerCount;
  const hasQualifier = qualifierMatchCount > 0;
  const initialStage: EliminationStage = hasQualifier
    ? "ELIMINATION_PLAY_IN"
    : getEliminationStageForBracketSize(playerCount);

  const rankedPlayers = sortPlayersByRanking(dbPlayers).map((player, index) => ({
    ...player,
    topCutSeed: index + 1,
  }));
  const playersBySeed = new Map(
    rankedPlayers.map((player) => [player.topCutSeed!, player]),
  );

  return {
    playerCount,
    bracketSize,
    mainBracketSize,
    matchCount: bracketSize / 2,
    qualifierMatchCount,
    byeCount,
    maxRounds: Math.log2(mainBracketSize) + (hasQualifier ? 1 : 0),
    stage: initialStage,
    seededPlayers: rankedPlayers,
    matches: mapSeedsToMatches(bracketSize, playersBySeed),
  };
};

const getMatchWinnerId = (match: Pick<MatchInterface, "player1Id" | "player2Id" | "result">) => {
  if (match.result === "P1") return match.player1Id;
  if (match.result === "P2") return match.player2Id;
  return null;
};

export const assertEliminationRoundResolved = (
  matches: Pick<MatchInterface, "player1Id" | "player2Id" | "result">[],
) => {
  if (matches.some((match) => match.result === null)) {
    throw new Error("Todas las partidas de eliminación deben estar resueltas.");
  }

  if (matches.some((match) => match.result === "DRAW")) {
    throw new Error("Los brackets eliminatorios no permiten empates.");
  }
};

export const buildNextEliminationRound = (
  currentRound: {
    stage?: RoundStage | null;
    bracketSize?: number | null;
    matches: MatchInterface[];
  },
  players: TournamentPlayerInterface[],
) => {
  assertEliminationRoundResolved(currentRound.matches);

  const orderedMatches = [...currentRound.matches].sort(
    (a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0),
  );
  const playersById = new Map(players.map((player) => [player.id, player]));
  const winners = orderedMatches.map((match) => {
    const winnerId = getMatchWinnerId(match);
    const winner = winnerId ? playersById.get(winnerId) : null;
    if (!winner) {
      throw new Error("No se pudo resolver un ganador del bracket.");
    }
    return winner;
  });

  if (winners.length < 2 || (winners.length & (winners.length - 1)) !== 0) {
    throw new Error("Los ganadores no forman un bracket válido.");
  }

  const bracketSize = winners.length;
  const matches: EliminationMatchSeed[] = [];
  for (let index = 0; index < winners.length; index += 2) {
    matches.push({
      player1: winners[index],
      player2: winners[index + 1],
      bracketPosition: index / 2 + 1,
    });
  }

  return {
    bracketSize,
    stage: getEliminationStageForBracketSize(bracketSize),
    matches,
  };
};
