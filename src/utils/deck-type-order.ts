import type { Decklist } from "@/interfaces";

const TYPE_ORDER = [
  "unidad",
  "conjuro",
  "ente",
  "arma",
  "ficha",
  "alma",
  "limbo",
] as const;

const TYPE_PRIORITY = new Map<string, number>([
  ["unidad", 0],
  ["conjuro", 1],
  ["ente", 2],
  ["arma", 3],
  ["ficha", 4],
  ["alma", 5],
  ["limbo", 6],
]);

const normalizeTypeName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const getTypePriority = (entry: Decklist) => {
  let priority = Number.MAX_SAFE_INTEGER;

  entry.card.types.forEach((type) => {
    const normalizedType = normalizeTypeName(type.name);
    const typePriority = TYPE_PRIORITY.get(normalizedType);
    if (typeof typePriority === "number" && typePriority < priority) {
      priority = typePriority;
    }
  });

  return priority;
};

export const sortDecklistByTypeOrder = (decklist: Decklist[]) =>
  decklist
    .map((entry, index) => ({
      entry,
      index,
      priority: getTypePriority(entry),
    }))
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.index - b.index;
    })
    .map(({ entry }) => entry);

export const DECK_TYPE_ORDER_LABEL = TYPE_ORDER.join(" > ");
