import assert from "node:assert/strict";
import { test } from "node:test";
import { hasDuplicateTokenCopies, uniqueTokenEntries } from "../src/logic/token-deck";

const entry = (idd: string, count = 1, variant = "normal") => ({
  card: { idd, code: `${idd}-${variant}` }, count,
});

test("allows different tokens once each", () => {
  assert.equal(hasDuplicateTokenCopies([entry("F001"), entry("F002")]), false);
});

test("rejects repeated quantities and separate entries", () => {
  assert.equal(hasDuplicateTokenCopies([entry("F001", 2)]), true);
  assert.equal(hasDuplicateTokenCopies([entry("F001"), entry("F001")]), true);
});

test("variants of one token share the same one-copy limit", () => {
  assert.equal(hasDuplicateTokenCopies([
    entry("F001"), entry(" f001 ", 1, "foil"),
  ]), true);
});

test("import keeps one of each token without mutating the original list", () => {
  const entries = [entry("F001", 3), entry("F001", 2, "foil"), entry("F002", 2)];
  const result = uniqueTokenEntries(entries);
  assert.deepEqual(result, [entry("F001"), entry("F002")]);
  assert.equal(entries[0].count, 3);
  assert.equal(hasDuplicateTokenCopies(result), false);
});

test("empty lists stay empty", () => {
  assert.equal(hasDuplicateTokenCopies([]), false);
  assert.deepEqual(uniqueTokenEntries([]), []);
});
