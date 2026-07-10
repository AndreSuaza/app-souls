import { ENCODED_SECTION_SEPARATOR, parseEncodedDeckSegment } from "@/utils/decklist";

type SimulatorDeckSource = {
  cards: string;
  id: string;
  name: string;
  userId: string;
};

const countDeckEntries = (entries: { count: number }[]) =>
  entries.reduce((total, entry) => total + entry.count, 0);

export const toSimulatorDeckDto = (deck: SimulatorDeckSource) => {
  const [mainSegment = "", limboSegment = ""] = deck.cards.split(ENCODED_SECTION_SEPARATOR);
  const mainDeck = parseEncodedDeckSegment(mainSegment).map(({ key, count }) => ({ cardId: key, count }));
  const limboDeck = parseEncodedDeckSegment(limboSegment).map(({ key, count }) => ({ cardId: key, count }));
  const soulDeck: { cardId: string; count: number }[] = [];

  return {
    id: deck.id,
    name: deck.name,
    ownerUserId: deck.userId,
    mainDeck,
    soulDeck,
    limboDeck,
    mainDeckCount: countDeckEntries(mainDeck),
    soulDeckCount: 0,
    limboDeckCount: countDeckEntries(limboDeck),
  };
};
