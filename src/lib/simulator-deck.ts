import { ENCODED_SECTION_SEPARATOR, parseEncodedDeckSegment } from "@/utils/decklist";

type SimulatorCardType = "unit" | "conjure" | "weapon" | "entity";

type SimulatorCardSource = {
  id: string;
  idd?: string | null;
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
  cardsNumber?: number | null;
  id: string;
  name: string;
  userId: string;
};

const countDeckEntries = (entries: { count: number }[]) =>
  entries.reduce((total, entry) => total + entry.count, 0);

const cardDeckKeys = (card: SimulatorCardSource) =>
  Array.from(
    new Set(
      [card.id, card.code, card.idd]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );

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

const isLimboCard = (card: SimulatorCardSource | undefined) =>
  card?.types.some((type) => normalizeTypeName(type.name) === "limbo") ?? false;

const countEntries = (entries: { count: number }[]) =>
  entries.reduce((total, entry) => total + entry.count, 0);

const splitMainAndLimboEntries = (
  entries: { cardId: string; count: number }[],
  cardByDeckKey: Map<string, SimulatorCardSource>,
  expectedMainCount?: number | null,
) => {
  const normalizedMainCount = Number.isFinite(expectedMainCount)
    ? Math.max(0, Math.trunc(expectedMainCount as number))
    : 0;
  const mappedEntries = entries.map((entry) => ({
    cardId: cardByDeckKey.get(entry.cardId)?.id ?? entry.cardId,
    count: entry.count,
    sourceCard: cardByDeckKey.get(entry.cardId),
  }));
  const splitByExpectedCount = () => {
    const mainDeck: { cardId: string; count: number }[] = [];
    const limboDeck: { cardId: string; count: number }[] = [];
    let mainCount = 0;

    mappedEntries.forEach((entry) => {
      const deckEntry = { cardId: entry.cardId, count: entry.count };
      if (
        mainCount < normalizedMainCount &&
        mainCount + entry.count <= normalizedMainCount
      ) {
        mainDeck.push(deckEntry);
        mainCount += entry.count;
        return;
      }
      limboDeck.push(deckEntry);
    });

    return { mainDeck, limboDeck };
  };

  const mainByType: { cardId: string; count: number }[] = [];
  const limboByType: { cardId: string; count: number }[] = [];

  mappedEntries.forEach((entry) => {
    const deckEntry = { cardId: entry.cardId, count: entry.count };
    if (isLimboCard(entry.sourceCard)) {
      limboByType.push(deckEntry);
      return;
    }
    mainByType.push(deckEntry);
  });

  if (limboByType.length > 0) {
    if (normalizedMainCount > 0 && countEntries(mainByType) !== normalizedMainCount) {
      return splitByExpectedCount();
    }
    return { mainDeck: mainByType, limboDeck: limboByType };
  }

  if (normalizedMainCount <= 0) {
    return {
      mainDeck: mappedEntries.map((entry) => ({
        cardId: entry.cardId,
        count: entry.count,
      })),
      limboDeck: [] as { cardId: string; count: number }[],
    };
  }

  return splitByExpectedCount();
};

export const toSimulatorDeckDto = (
  deck: SimulatorDeckSource,
  cards: SimulatorCardSource[] = [],
) => {
  const [playSegment = ""] = deck.cards.split(
    ENCODED_SECTION_SEPARATOR,
  );
  const playDeck = parseEncodedDeckSegment(playSegment).map(
    ({ key, count }) => ({ cardId: key, count }),
  );
  const soulDeck: { cardId: string; count: number }[] = [];
  const cardByDeckKey = new Map<string, SimulatorCardSource>();
  cards.forEach((card) => {
    cardDeckKeys(card).forEach((key) => cardByDeckKey.set(key, card));
  });
  const { mainDeck, limboDeck } = splitMainAndLimboEntries(
    playDeck,
    cardByDeckKey,
    deck.cardsNumber,
  );

  return {
    id: deck.id,
    name: deck.name,
    ownerUserId: deck.userId,
    mainDeck,
    soulDeck,
    limboDeck,
    cards: cards.map((card) => ({
      id: card.id,
      code: card.code,
      aliases: cardDeckKeys(card),
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
