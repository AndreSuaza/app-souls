import {
  MatchInterface,
  RoundStage,
  TournamentPlayerInterface,
} from "@/interfaces";
import { sortPlayersByRanking } from "@/utils/ranking";

export const TOP_CUT_SIZE = 8;

export const TOP_CUT_QUARTERFINAL_PAIRINGS = [
  [1, 8],
  [4, 5],
  [2, 7],
  [3, 6],
] as const;

export const isTopCutTournamentType = (typeTournamentName?: string | null) =>
  typeTournamentName === "Tier 1" || typeTournamentName === "Tier 2";

export const isTopCutStage = (stage?: RoundStage | null) =>
  stage === "TOP8_QUARTERFINAL" ||
  stage === "TOP8_SEMIFINAL" ||
  stage === "TOP8_FINAL";

export const isSwissStage = (stage?: RoundStage | null) =>
  !stage || stage === "SWISS";

export const getRoundStageLabel = (stage?: RoundStage | null) => {
  if (stage === "TOP8_QUARTERFINAL") return "Top 8 - Cuartos";
  if (stage === "TOP8_SEMIFINAL") return "Top 8 - Semifinal";
  if (stage === "TOP8_FINAL") return "Top 8 - Final";
  return "Ronda";
};

export const getTopCutSeededPlayers = (
  players: TournamentPlayerInterface[],
) => {
  return sortPlayersByRanking(players)
    .slice(0, TOP_CUT_SIZE)
    .map((player, index) => ({
      ...player,
      topCutSeed: index + 1,
    }));
};

export const getFrozenTopCutPlayers = (
  players: TournamentPlayerInterface[],
) => {
  const seededPlayers = players
    .filter((player) => typeof player.topCutSeed === "number")
    .sort((a, b) => (a.topCutSeed ?? 99) - (b.topCutSeed ?? 99));

  return seededPlayers.length > 0 ? seededPlayers : getTopCutSeededPlayers(players);
};

export const getTopCutPlayerBySeed = (
  players: TournamentPlayerInterface[],
  seed: number,
) => players.find((player) => player.topCutSeed === seed);

export const getMatchWinnerId = (match: MatchInterface) => {
  if (match.result === "P1") return match.player1Id;
  if (match.result === "P2") return match.player2Id;
  return null;
};

export const getMatchLoserId = (match: MatchInterface) => {
  if (match.result === "P1") return match.player2Id;
  if (match.result === "P2") return match.player1Id;
  return null;
};

export const assertTopCutRoundResolved = (matches: MatchInterface[]) => {
  if (matches.some((match) => match.result === null)) {
    throw new Error("No puedes finalizar el bracket: hay partidas sin resultado.");
  }

  if (matches.some((match) => match.result === "DRAW")) {
    throw new Error("El bracket Top 8 no permite empates.");
  }
};

export const getNextTopCutStage = (
  stage?: RoundStage | null,
): RoundStage | null => {
  if (stage === "TOP8_QUARTERFINAL") return "TOP8_SEMIFINAL";
  if (stage === "TOP8_SEMIFINAL") return "TOP8_FINAL";
  return null;
};

const getPlayerById = (
  players: TournamentPlayerInterface[],
  playerId: string | null | undefined,
) => {
  if (!playerId) return null;
  return players.find((player) => player.id === playerId) ?? null;
};

export const buildTopCutSemifinalPairings = (
  quarterfinalMatches: MatchInterface[],
  players: TournamentPlayerInterface[],
) => {
  assertTopCutRoundResolved(quarterfinalMatches);

  const orderedMatches = [...quarterfinalMatches].sort(
    (a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0),
  );

  const firstWinner = getPlayerById(players, getMatchWinnerId(orderedMatches[0]));
  const secondWinner = getPlayerById(players, getMatchWinnerId(orderedMatches[1]));
  const thirdWinner = getPlayerById(players, getMatchWinnerId(orderedMatches[2]));
  const fourthWinner = getPlayerById(players, getMatchWinnerId(orderedMatches[3]));

  if (!firstWinner || !secondWinner || !thirdWinner || !fourthWinner) {
    throw new Error("No se pudieron resolver los ganadores de cuartos.");
  }

  return [
    { player1: firstWinner, player2: secondWinner, bracketPosition: 1 },
    { player1: thirdWinner, player2: fourthWinner, bracketPosition: 2 },
  ];
};

export const buildTopCutFinalPairing = (
  semifinalMatches: MatchInterface[],
  players: TournamentPlayerInterface[],
) => {
  assertTopCutRoundResolved(semifinalMatches);

  const orderedMatches = [...semifinalMatches].sort(
    (a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0),
  );

  const firstWinner = getPlayerById(players, getMatchWinnerId(orderedMatches[0]));
  const secondWinner = getPlayerById(players, getMatchWinnerId(orderedMatches[1]));

  if (!firstWinner || !secondWinner) {
    throw new Error("No se pudieron resolver los ganadores de semifinal.");
  }

  return [{ player1: firstWinner, player2: secondWinner, bracketPosition: 1 }];
};

export const getTopCutChampionId = (rounds: { stage?: RoundStage | null; matches: MatchInterface[] }[]) => {
  const finalRound = rounds.find((round) => round.stage === "TOP8_FINAL");
  const finalMatch = finalRound?.matches[0];
  if (!finalMatch || finalMatch.result === "DRAW") return null;
  return getMatchWinnerId(finalMatch);
};
