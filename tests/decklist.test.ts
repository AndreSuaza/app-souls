import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ENCODED_SECTION_SEPARATOR,
  encodeDecklistForQueryParam,
  isEncodedDecklist,
  normalizeEncodedDecklist,
  parseEncodedDeckSegment,
  serializeEncodedDecklist,
} from "../src/utils/decklist";

const mainEntries = [
  { code: "GNC-004", count: 2 },
  { code: "ME1,2,3,4-023", count: 2 },
];
const sideEntries = [
  { code: "AVE-005", count: 2 },
  { code: "IMD-058", count: 1 },
];

test("codifica y decodifica una lista completa sin caracteres URL reservados", () => {
  const serialized = serializeEncodedDecklist(mainEntries, sideEntries);
  const encoded = encodeDecklistForQueryParam(serialized);

  assert.match(encoded, /^d1_[A-Za-z0-9_-]+$/);
  assert.doesNotMatch(encoded, /%/);
  assert.equal(normalizeEncodedDecklist(encoded), serialized);
  assert.equal(isEncodedDecklist(encoded), true);
});

test("mantiene separados el mazo principal y el side deck", () => {
  const serialized = serializeEncodedDecklist(mainEntries, sideEntries);
  const normalized = normalizeEncodedDecklist(
    encodeDecklistForQueryParam(serialized),
  );
  const [main, side] = normalized.split(ENCODED_SECTION_SEPARATOR);

  assert.deepEqual(parseEncodedDeckSegment(main), [
    { key: "GNC-004", count: 2 },
    { key: "ME1,2,3,4-023", count: 2 },
  ]);
  assert.deepEqual(parseEncodedDeckSegment(side), [
    { key: "AVE-005", count: 2 },
    { key: "IMD-058", count: 1 },
  ]);
});

test("acepta el enlace legado doblemente codificado por la URL", () => {
  const legacyValue =
    "GNC-004%253A2%253BME1%252C2%252C3%252C4-023%253A2%253B%257CAVE-005%253A2%253B";
  const queryValue = new URL(
    `https://soulsinxtinction.com/laboratorio?decklist=${legacyValue}`,
  ).searchParams.get("decklist");

  assert.ok(queryValue);
  assert.deepEqual(parseEncodedDeckSegment(queryValue.split("%7C")[0]), [
    { key: "GNC-004", count: 2 },
    { key: "ME1,2,3,4-023", count: 2 },
  ]);
  assert.deepEqual(parseEncodedDeckSegment(queryValue.split("%7C")[1]), [
    { key: "AVE-005", count: 2 },
  ]);
});

test("rechaza silenciosamente un payload d1 inválido", () => {
  assert.equal(normalizeEncodedDecklist("d1_not-valid"), "");
  assert.deepEqual(parseEncodedDeckSegment("d1_not-valid"), []);
  assert.equal(isEncodedDecklist("d1_not-valid"), false);
});
