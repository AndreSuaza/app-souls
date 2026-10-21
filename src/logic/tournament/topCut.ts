import {
  MatchInterface,
  RoundStage,
  TournamentPlayerInterface,
} from "@/interfaces";
import { sortPlayersByRanking } from "@/utils/ranking";

export const TOP_CUT_SIZE = 8;

export const TOP_CUT_PV_POINTS = {
  champion: 45,
  runnerUp: 35,
  semifinalist: 25,
  quarterfinalist: 15,
} as const;

export const TOP_CUT_PV_BY_POSITION = [
  TOP_CUT_PV_POINTS.champion,
  TOP_CUT_PV_POINTS.runnerUp,
  TOP_CUT_PV_POINTS.semifinalist,
  TOP_CUT_PV_POINTS.semifinalist,
  TOP_CUT_PV_POINTS.quarterfinalist,
  TOP_CUT_PV_POINTS.quarterfinalist,
  TOP_CUT_PV_POINTS.quarterfinalist,
  TOP_CUT_PV_POINTS.quarterfinalist,
] as const;

export const TOP_CUT_QUARTERFINAL_PAIRINGS = [
  [1, 8],
  [4, 5],
  [2, 7],
  [3, 6],
] as const;

export const ELIMINATION_SEMIFINAL_PAIRINGS = [
  [1, 4],
  [2, 3],
] as const;

export const ELIMINATION_ROUND_OF_16_PAIRINGS = [
  [1, 16],
  [8, 9],
  [4, 13],
  [5, 12],
  [2, 15],
  [7, 10],
  [3, 14],
  [6, 11],
] as const;

export const isTopCutTournamentType = (typeTournamentName?: string | null) =>
  typeTournamentName === "Tier 1";

export const isTopCutStage = (stage?: RoundStage | null) =>
  stage === "TOP8_QUARTERFINAL" ||
  stage === "TOP8_SEMIFINAL" ||
  stage === "TOP8_FINAL";

export const isEliminationStage = (stage?: RoundStage | null) =>
  stage === "ELIMINATION_ROUND_OF_16" ||
  stage === "ELIMINATION_QUARTERFINAL" ||
  stage === "ELIMINATION_SEMIFINAL" ||
  stage === "ELIMINATION_FINAL";

export const isBracketStage = (stage?: RoundStage | null) =>
  isTopCutStage(stage) || isEliminationStage(stage);

export const isSwissStage = (stage?: RoundStage | null) =>
  !stage || stage === "SWISS";

export const getRoundStageLabel = (stage?: RoundStage | null) => {
  if (stage === "TOP8_QUARTERFINAL") return "Top 8 - Cuartos";
  if (stage === "TOP8_SEMIFINAL") return "Top 8 - Semifinal";
  if (stage === "TOP8_FINAL") return "Top 8 - Final";
  if (stage === "ELIMINATION_ROUND_OF_16") return "Eliminación - Ronda de 16";
  if (stage === "ELIMINATION_QUARTERFINAL") return "Eliminación - Cuartos";
  if (stage === "ELIMINATION_SEMIFINAL") return "Eliminación - Semifinal";
  if (stage === "ELIMINATION_FINAL") return "Eliminación - Final";
  return "Ronda";
};

export const getBracketChampionId = (
  rounds: { stage?: RoundStage | null; matches: MatchInterface[] }[],
  kind: "topCut" | "elimination",
) => {
  const finalStage = kind === "topCut" ? "TOP8_FINAL" : "ELIMINATION_FINAL";
  const finalRound = rounds.find((round) => round.stage === finalStage);
  const finalMatch = finalRound?.matches[0];
  if (!finalMatch || finalMatch.result === "DRAW") return null;
  return getMatchWinnerId(finalMatch);
};

export const getNextEliminationStage = (
  stage?: RoundStage | null,
): RoundStage | null => {
  if (stage === "ELIMINATION_ROUND_OF_16") return "ELIMINATION_QUARTERFINAL";
  if (stage === "ELIMINATION_QUARTERFINAL") return "ELIMINATION_SEMIFINAL";
  if (stage === "ELIMINATION_SEMIFINAL") return "ELIMINATION_FINAL";
  return null;
};

const getPlayerById = (
  players: TournamentPlayerInterface[],
  playerId: string | null | undefined,
) => {
  if (!playerId) return null;
  return players.find((player) => player.id === playerId) ?? null;
};

export const buildEliminationQuarterfinalPairings = (
  roundOf16Matches: MatchInterface[],
  players: TournamentPlayerInterface[],
) => {
  assertTopCutRoundResolved(roundOf16Matches);

  const orderedMatches = [...roundOf16Matches].sort(
    (a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0),
  );
  const winners = orderedMatches.map((match) =>
    getPlayerById(players, getMatchWinnerId(match)),
  );

  if (winners.some((player) => !player)) {
    throw new Error("No se pudieron resolver los ganadores de la ronda de 16.");
  }

  return [1, 2, 3, 4].map((bracketPosition, index) => ({
    player1: winners[index * 2]!,
    player2: winners[index * 2 + 1]!,
    bracketPosition,
  }));
};

export const buildEliminationSemifinalPairings = (
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

export const buildEliminationFinalPairing = (
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

type ResolvedMatch = Pick<
  MatchInterface,
  "player1Id" | "player2Id" | "result"
>;

type TopCutPlacementRound = {
  stage?: RoundStage | null;
  matches: ResolvedMatch[];
};

export const getMatchWinnerId = (match: ResolvedMatch) => {
  if (match.result === "P1") return match.player1Id;
  if (match.result === "P2") return match.player2Id;
  return null;
};

export const getMatchLoserId = (match: ResolvedMatch) => {
  if (match.result === "P1") return match.player2Id;
  if (match.result === "P2") return match.player1Id;
  return null;
};

export const assertTopCutRoundResolved = (
  matches: Pick<MatchInterface, "result">[],
) => {
  if (matches.some((match) => match.result === null)) {
    throw new Error("No puedes finalizar el bracket: hay partidas sin resultado.");
  }

  if (matches.some((match) => match.result === "DRAW")) {
    throw new Error("Los brackets eliminatorios no permiten empates.");
  }
};

export const getTopCutPvByPlayerId = (rounds: TopCutPlacementRound[]) => {
  const quarterfinal = rounds.find(
    (round) => round.stage === "TOP8_QUARTERFINAL",
  );
  const semifinal = rounds.find(
    (round) => round.stage === "TOP8_SEMIFINAL",
  );
  const final = rounds.find((round) => round.stage === "TOP8_FINAL");

  if (
    quarterfinal?.matches.length !== 4 ||
    semifinal?.matches.length !== 2 ||
    final?.matches.length !== 1
  ) {
    throw new Error("El bracket Top 8 esta incompleto.");
  }

  assertTopCutRoundResolved(quarterfinal.matches);
  assertTopCutRoundResolved(semifinal.matches);
  assertTopCutRoundResolved(final.matches);

  const finalMatch = final.matches[0];
  const championId = getMatchWinnerId(finalMatch);
  const runnerUpId = getMatchLoserId(finalMatch);
  const semifinalistIds = semifinal.matches.map(getMatchLoserId);
  const quarterfinalistIds = quarterfinal.matches.map(getMatchLoserId);

  if (
    !championId ||
    !runnerUpId ||
    semifinalistIds.some((playerId) => !playerId) ||
    quarterfinalistIds.some((playerId) => !playerId)
  ) {
    throw new Error("No se pudieron resolver las posiciones del Top 8.");
  }

  const pvByPlayerId = new Map<string, number>([
    [championId, TOP_CUT_PV_POINTS.champion],
    [runnerUpId, TOP_CUT_PV_POINTS.runnerUp],
  ]);

  semifinalistIds.forEach((playerId) => {
    pvByPlayerId.set(playerId as string, TOP_CUT_PV_POINTS.semifinalist);
  });
  quarterfinalistIds.forEach((playerId) => {
    pvByPlayerId.set(playerId as string, TOP_CUT_PV_POINTS.quarterfinalist);
  });

  if (pvByPlayerId.size !== TOP_CUT_SIZE) {
    throw new Error("Las posiciones del Top 8 contienen jugadores duplicados.");
  }

  return pvByPlayerId;
};

export const getNextTopCutStage = (
  stage?: RoundStage | null,
): RoundStage | null => {
  if (stage === "TOP8_QUARTERFINAL") return "TOP8_SEMIFINAL";
  if (stage === "TOP8_SEMIFINAL") return "TOP8_FINAL";
  return null;
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
  return getBracketChampionId(rounds, "topCut");
};

export const getEliminationChampionId = (
  rounds: { stage?: RoundStage | null; matches: MatchInterface[] }[],
) => getBracketChampionId(rounds, "elimination");
