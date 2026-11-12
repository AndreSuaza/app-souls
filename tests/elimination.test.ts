import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildNextEliminationRound,
  getInitialEliminationPlan,
} from "../src/logic/tournament/elimination";
import type {
  MatchInterface,
  TournamentPlayerInterface,
} from "../src/interfaces";

const createPlayers = (count: number): TournamentPlayerInterface[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    userId: `user-${index + 1}`,
    playerNickname: `Player ${index + 1}`,
    points: count - index,
    pointsInitial: 0,
    hadBye: false,
    buchholz: 0,
    rivals: [],
  }));

const createResolvedMatches = (
  plan: ReturnType<typeof getInitialEliminationPlan>,
): MatchInterface[] =>
  plan.matches.map((match) => ({
    id: `match-${match.bracketPosition}`,
    player1Id: match.player1.id,
    player1Nickname: match.player1.playerNickname,
    player2Id: match.player2?.id ?? null,
    player2Nickname: match.player2?.playerNickname ?? "BYE",
    result: "P1",
    bracketPosition: match.bracketPosition,
  }));

for (const playerCount of [8, 9, 12, 15, 16, 17, 20, 25, 31, 32, 33]) {
  test(`construye un bracket válido para ${playerCount} jugadores`, () => {
    const plan = getInitialEliminationPlan(createPlayers(playerCount));
    const playerIds = plan.matches.flatMap((match) => [
      match.player1.id,
      ...(match.player2 ? [match.player2.id] : []),
    ]);

    assert.equal(plan.matches.length, plan.bracketSize / 2);
    assert.equal(plan.byeCount, plan.bracketSize - playerCount);
    assert.equal(plan.qualifierMatchCount, playerCount - plan.mainBracketSize);
    assert.equal(new Set(playerIds).size, playerCount);
    assert.equal(
      plan.matches.filter((match) => match.player2 === null).length,
      plan.byeCount,
    );
  });
}

for (const playerCount of [9, 12, 17, 20, 25, 33]) {
  test(`la ronda preliminar de ${playerCount} forma el bracket principal`, () => {
    const players = createPlayers(playerCount);
    const plan = getInitialEliminationPlan(players);
    const nextRound = buildNextEliminationRound(
      {
        stage: plan.stage,
        bracketSize: plan.bracketSize,
        matches: createResolvedMatches(plan),
      },
      players,
    );

    assert.equal(nextRound.bracketSize, plan.mainBracketSize);
    assert.equal(nextRound.matches.length, plan.mainBracketSize / 2);
    assert.equal(
      nextRound.matches.flatMap((match) => [match.player1.id, match.player2?.id]).filter(Boolean).length,
      plan.mainBracketSize,
    );
  });
}

test("un campeón de eliminación directa requiere N - 1 partidas", () => {
  for (const playerCount of [8, 12, 20, 25, 33]) {
    const plan = getInitialEliminationPlan(createPlayers(playerCount));
    const totalMatches = plan.qualifierMatchCount + plan.mainBracketSize - 1;
    assert.equal(totalMatches, playerCount - 1);
  }
});
