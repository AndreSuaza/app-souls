import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSimulatorDeckMutation } from "../src/lib/simulator-deck-api";

test("simulator deck mutations use the shared deck validation contract", () => {
  const result = parseSimulatorDeckMutation({
    archetypesId: "archetype-id",
    deckList: "MAIN%3A40%3B%7CLIMBO%3A1%3B",
    description: "Mazo de prueba",
    imgDeck: "MAIN-card",
    name: "Mazo sincronizado",
    tokenDeckList: "TOKEN%3A1%3B",
    visible: true,
  });

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.cardsNumber, 40);
  assert.equal(result.data.tokenCardsNumber, 1);
  assert.equal(result.data.visible, true);
});

test("simulator deck mutations reject invalid payloads before persistence", () => {
  const result = parseSimulatorDeckMutation({
    deckList: "MAIN%3A1%3B",
    name: "",
  });

  assert.equal(result.success, false);
  if (result.success) return;
  assert.match(result.message, /requerido|requerida|valido/i);
});

