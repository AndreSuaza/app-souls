"use server";

import { Card } from "@/interfaces";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface Decklist {
  count: number;
  card: Card;
}

const parseDeckEntries = (ids: string) => {
  const entries: Array<{ key: string; count: number }> = [];

  if (ids.includes(":")) {
    const pairs = ids
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);

    pairs.forEach((pair) => {
      const [key, countRaw] = pair.split(":").map((item) => item.trim());
      const count = Number.parseInt(countRaw ?? "", 10);

      if (!key || Number.isNaN(count)) {
        return;
      }

      entries.push({ key, count });
    });

    return entries;
  }

  const parts = ids
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  for (let index = 0; index < parts.length; index += 2) {
    const key = parts[index];
    const countRaw = parts[index + 1];
    const count = Number.parseInt(countRaw ?? "", 10);

    if (!key || Number.isNaN(count)) {
      continue;
    }

    entries.push({ key, count });
  }

  return entries;
};

const getCardsByIds = async (ids: string) => {
  if (!ids) return [];
  let deck: Decklist[] = [];
  const entries = parseDeckEntries(ids);
  const keys = entries.map((entry) => entry.key);
  const iddKeys = keys.filter((key) => /^\d+$/.test(key));
  const codeKeys = keys.filter((key) => !/^\d+$/.test(key));

  if (iddKeys.length === 0 && codeKeys.length === 0) {
    return [];
  }

  try {
    const orFilters: Prisma.CardWhereInput[] = [];
    if (iddKeys.length > 0) {
      orFilters.push({
        idd: {
          in: iddKeys,
        },
      });
    }
    if (codeKeys.length > 0) {
      orFilters.push({
        code: {
          in: codeKeys,
        },
      });
    }

    const cards: Prisma.CardGetPayload<{
      include: {
        product: {
          select: {
            name: true;
            code: true;
            show: true;
            url: true;
          };
        };
        types: {
          select: {
            name: true;
          };
        };
        keywords: {
          select: {
            name: true;
          };
        };
        rarities: {
          select: {
            name: true;
            id: true;
          };
        };
        archetypes: {
          select: {
            name: true;
          };
        };
      };
    }>[] = await prisma.card.findMany({
      include: {
        product: {
          select: {
            name: true,
            code: true,
            show: true,
            url: true,
          },
        },
        types: {
          select: {
            name: true,
          },
        },
        keywords: {
          select: {
            name: true,
          },
        },
        rarities: {
          select: {
            name: true,
            id: true,
          },
        },
        archetypes: {
          select: {
            name: true,
          },
        },
      },
      where: {
        OR: orFilters,
      },
    });

    const cardByCode = new Map(cards.map((card) => [card.code, card]));
    // Mantenemos el primer registro por idd para no duplicar cartas legacy.
    const cardByIdd = new Map<string, (typeof cards)[number]>();
    cards.forEach((card) => {
      if (!cardByIdd.has(card.idd)) {
        cardByIdd.set(card.idd, card);
      }
    });

    entries.forEach((entry) => {
      const card = cardByCode.get(entry.key) ?? cardByIdd.get(entry.key);
      if (!card) return;

      deck = [
        ...deck,
        {
          card: {
            id: card.id,
            idd: card.idd,
            code: card.code,
            types: card.types,
            limit: card.limit,
            rarities: card.rarities,
            cost: card.cost,
            force: card.force,
            defense: card.defense,
            archetypes: card.archetypes,
            keywords: card.keywords,
            name: card.name,
            effect: card.effect,
            product: card.product,
            price: card.price ?? null,
          },
          count: entry.count,
        },
      ];
    });

    return deck;
  } catch (error) {
    throw new Error(`No se pudo cargar las cartas ${error}`);
  }
};

export const getDecksByIds = async (ids?: string) => {
  if (!ids) return { mainDeck: [], sideDeck: [] };

  // Normalizamos decklists URL-encoded (admin y público) sin perder separadores.
  let normalizedIds = ids;
  if (normalizedIds.includes("%")) {
    try {
      normalizedIds = decodeURIComponent(normalizedIds);
    } catch {
      normalizedIds = normalizedIds
        .replace(/%7C/gi, "|")
        .replace(/%3B/gi, ";")
        .replace(/%3A/gi, ":");
    }
  }

  // Dividimos en [main, side]
  const [mainIds = "", sideIds = ""] = normalizedIds.split("|");

  // Ejecutamos en paralelo
  const [mainDeck, sideDeck] = await Promise.all([
    getCardsByIds(mainIds),
    getCardsByIds(sideIds),
  ]);

  return { mainDeck, sideDeck };
};
