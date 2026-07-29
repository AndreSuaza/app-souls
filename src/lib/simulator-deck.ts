import { ENCODED_SECTION_SEPARATOR, parseEncodedDeckSegment } from "@/utils/decklist";

type SimulatorCardType = "unit" | "conjure" | "weapon" | "entity";

type SimulatorCardSource = {
  id: string;
  code: string;
  name: string;
  types: { name: string }[];
  cost: number;
  force: string;
  defense: string;
  effect: string;
  imageUrl?: string;
};

type SimulatorDeckSource = {
  cards: string;
  id: string;
  name: string;
  userId: string;
};

const countDeckEntries = (entries: { count: number }[]) =>
  entries.reduce((total, entry) => total + entry.count, 0);

const mapDeckEntriesToCardIds = (
  entries: { cardId: string; count: number }[],
  cardByCode: Map<string, SimulatorCardSource>,
) =>
  entries.map((entry) => ({
    cardId: cardByCode.get(entry.cardId)?.id ?? entry.cardId,
    count: entry.count,
  }));

const normalizeTypeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const toSimulatorCardType = (typeName: string): SimulatorCardType | null => {
  const normalized = normalizeTypeName(typeName);
  if (normalized === "unidad" || normalized === "unit") return "unit";
  if (normalized === "conjuro" || normalized === "conjure") return "conjure";
  if (normalized === "arma" || normalized === "weapon") return "weapon";
  if (
    normalized === "entidad" ||
    normalized === "ente" ||
    normalized === "entity"
  ) {
    return "entity";
  }
  return null;
};

const toSimulatorCardTypes = (
  types: { name: string }[],
): SimulatorCardType[] => {
  const mappedTypes = types.flatMap((type) => {
    const cardType = toSimulatorCardType(type.name);
    return cardType ? [cardType] : [];
  });

  return mappedTypes.length > 0 ? mappedTypes : ["entity"];
};

export const toSimulatorDeckDto = (
  deck: SimulatorDeckSource,
  cards: SimulatorCardSource[] = [],
) => {
  const [mainSegment = "", limboSegment = ""] = deck.cards.split(
    ENCODED_SECTION_SEPARATOR,
  );
  const mainDeck = parseEncodedDeckSegment(mainSegment).map(
    ({ key, count }) => ({ cardId: key, count }),
  );
  const limboDeck = parseEncodedDeckSegment(limboSegment).map(
    ({ key, count }) => ({ cardId: key, count }),
  );
  const soulDeck: { cardId: string; count: number }[] = [];
  const cardByCode = new Map(cards.map((card) => [card.code, card]));

  return {
    id: deck.id,
    name: deck.name,
    ownerUserId: deck.userId,
    mainDeck: mapDeckEntriesToCardIds(mainDeck, cardByCode),
    soulDeck,
    limboDeck: mapDeckEntriesToCardIds(limboDeck, cardByCode),
    cards: cards.map((card) => ({
      id: card.id,
      code: card.code,
      name: card.name,
      types: toSimulatorCardTypes(card.types),
      cost: card.cost,
      ...(card.force ? { force: card.force } : {}),
      ...(card.defense ? { defense: card.defense } : {}),
      effect: card.effect,
      ...(card.imageUrl ? { imageUrl: card.imageUrl } : {}),
    })),
    mainDeckCount: countDeckEntries(mainDeck),
    soulDeckCount: 0,
    limboDeckCount: countDeckEntries(limboDeck),
  };
};
