import { countMainDeckCards } from "@/lib/deck-management";
import { SaveDeckSchema, type SaveDeckInput } from "@/schemas/decks/save-deck.schema";
import { normalizeEncodedDecklist, parseEncodedDeckSegment } from "@/utils/decklist";

type SimulatorDeckMutationBody = Record<string, unknown>;

export type SimulatorDeckMutationResult =
  | { success: true; data: SaveDeckInput }
  | { success: false; message: string };

const countTokenDeckCards = (deckList?: string) =>
  parseEncodedDeckSegment(normalizeEncodedDecklist(deckList ?? "")).reduce(
    (total, entry) => total + entry.count,
    0,
  );

export const parseSimulatorDeckMutation = (
  body: unknown,
  deckId?: string,
): SimulatorDeckMutationResult => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, message: "Datos de mazo invalidos." };
  }

  const value = body as SimulatorDeckMutationBody;
  const deckList = typeof value.deckList === "string" ? value.deckList : "";
  const tokenDeckList =
    typeof value.tokenDeckList === "string" ? value.tokenDeckList : "";
  const parsed = SaveDeckSchema.safeParse({
    archetypesId:
      typeof value.archetypesId === "string" ? value.archetypesId : "",
    cardsNumber:
      typeof value.cardsNumber === "number"
        ? Math.max(0, Math.trunc(value.cardsNumber))
        : countMainDeckCards(deckList),
    deckId,
    deckList,
    description:
      typeof value.description === "string" ? value.description : "",
    imgDeck: typeof value.imgDeck === "string" ? value.imgDeck : "",
    name: typeof value.name === "string" ? value.name : "",
    tokenCardsNumber: countTokenDeckCards(tokenDeckList),
    tokenDeckList,
    visible: Boolean(value.visible),
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Datos de mazo invalidos.",
    };
  }

  return { success: true, data: parsed.data };
};
