import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateBattlePassProgress, isPhysicalRewardPending } from "../src/logic/battle-pass-progress";

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

test("physical rewards become pending without a player claim", () => {
  assert.equal(isPhysicalRewardPending({ rewardType: "MANUAL", levelNumber: 15, progress: 15 }), true);
  assert.equal(isPhysicalRewardPending({ rewardType: "MANUAL", levelNumber: 16, progress: 15 }), false);
});

test("lowered progress hides old pending claims until the level is reached again", () => {
  const reward = { rewardType: "MANUAL", levelNumber: 4, claimStatus: "PENDING_FULFILLMENT" };
  assert.equal(isPhysicalRewardPending({ ...reward, progress: 3 }), false);
  assert.equal(isPhysicalRewardPending({ ...reward, progress: 4 }), true);
});

test("fulfilled rewards never become pending again", () => {
  for (const progress of [0, 3, 10]) {
    assert.equal(isPhysicalRewardPending({ rewardType: "MANUAL", levelNumber: 3, progress, claimStatus: "FULFILLED" }), false);
  }
});

test("digital rewards are excluded from store deliveries", () => {
  for (const rewardType of ["AVATAR", "BANNER", "PV"]) {
    assert.equal(isPhysicalRewardPending({ rewardType, levelNumber: 1, progress: 16 }), false);
  }
});
