import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateBattlePassProgress } from "../src/logic/battle-pass-progress";

test("battle pass progress uses automatic progress without offset", () => {
  assert.equal(
    calculateBattlePassProgress({
      automaticProgress: 3,
      manualOffset: 0,
      maxLevel: 10,
    }),
    3,
  );
});

test("battle pass progress applies positive and negative offsets", () => {
  assert.equal(
    calculateBattlePassProgress({
      automaticProgress: 3,
      manualOffset: 2,
      maxLevel: 10,
    }),
    5,
  );
  assert.equal(
    calculateBattlePassProgress({
      automaticProgress: 3,
      manualOffset: -1,
      maxLevel: 10,
    }),
    2,
  );
});

test("battle pass progress is clamped to zero", () => {
  assert.equal(
    calculateBattlePassProgress({
      automaticProgress: 1,
      manualOffset: -3,
      maxLevel: 10,
    }),
    0,
  );
});

test("battle pass progress is clamped to the max level", () => {
  assert.equal(
    calculateBattlePassProgress({
      automaticProgress: 9,
      manualOffset: 4,
      maxLevel: 10,
    }),
    10,
  );
});
