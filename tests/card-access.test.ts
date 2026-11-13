import test from "node:test";
import assert from "node:assert/strict";
import { cardKeyCandidates, accessibleCardWhere } from "../src/lib/card-access";

test("expands exact card keys without losing the original variant key", () => {
  assert.deepEqual(cardKeyCandidates("SET-001-507f1f77bcf86cd799439011"), [
    "SET-001-507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439011",
    "SET-001",
  ]);
});

test("anonymous access only includes public cards", () => {
  assert.deepEqual(accessibleCardWhere(), {
    OR: [{ OR: [{ access: "PUBLIC" }, { access: { isSet: false } }] }],
  });
});

test("authenticated access includes owned unlocked variants", () => {
  assert.deepEqual(accessibleCardWhere("507f1f77bcf86cd799439011"), {
    OR: [
      {
        OR: [{ access: "PUBLIC" }, { access: { isSet: false } }],
      },
      {
        access: "OWNED",
        userOwnerships: {
          some: { userId: "507f1f77bcf86cd799439011", unlocked: true },
        },
      },
    ],
  });
});
