import type { Decklist } from "@/interfaces";

const LIMBO_TYPE_NAME = "Limbo";

interface SplitMainAndLimboOptions {
  expectedMainCount?: number | null;
}

const isLimboCard = (item: Decklist) =>
  item.card.types.some((type) => type.name === LIMBO_TYPE_NAME);

export const splitMainAndLimboDeck = (
  rawDeck: Decklist[],
  { expectedMainCount }: SplitMainAndLimboOptions = {},
) => {
  const mainByType = rawDeck.filter((item) => !isLimboCard(item));
  const limboByType = rawDeck.filter((item) => isLimboCard(item));
  const normalizedMainCount = Number.isFinite(expectedMainCount)
    ? Math.max(0, Math.trunc(expectedMainCount as number))
    : 0;

  const splitByExpectedCount = () => {
    const mainDeck: Decklist[] = [];
    const limboDeck: Decklist[] = [];
    let mainCount = 0;

    rawDeck.forEach((item) => {
      // Fallback: si no hay tipos de carta, usamos el orden del deck code.
      if (
        mainCount < normalizedMainCount &&
        mainCount + item.count <= normalizedMainCount
      ) {
        mainDeck.push(item);
        mainCount += item.count;
        return;
      }
      limboDeck.push(item);
    });

    return { mainDeck, limboDeck };
  };

  if (limboByType.length > 0) {
    if (normalizedMainCount > 0) {
      const mainByTypeCount = mainByType.reduce(
        (acc, item) => acc + item.count,
        0,
      );
      // Si los tipos vienen incompletos, respetamos el corte del deck principal.
      if (mainByTypeCount !== normalizedMainCount) {
        return splitByExpectedCount();
      }
    }
    return { mainDeck: mainByType, limboDeck: limboByType };
  }

  if (normalizedMainCount <= 0) {
    return { mainDeck: [...rawDeck], limboDeck: [] as Decklist[] };
  }
  return splitByExpectedCount();
};
