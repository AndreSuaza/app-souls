"use server";

import { Card } from "@/interfaces";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import {
  ENCODED_SECTION_SEPARATOR,
  hasRawDecklistSeparators,
  normalizeEncodedDecklist,
  parseEncodedDeckSegment,
} from "@/utils/decklist";

export interface Decklist {
  count: number;
  card: Card;
}

let cardImageCodeToIddCache: Map<string, string> | null = null;

const getCardImageCodeToIddMap = () => {
  if (cardImageCodeToIddCache) return cardImageCodeToIddCache;

  const map = new Map<string, string>();
  try {
    const cardsDir = path.join(process.cwd(), "public", "cards");
    const files = fs.readdirSync(cardsDir);

    files.forEach((fileName) => {
      const match = /^(.*)-(\d+)\.webp$/i.exec(fileName);
      if (!match) return;

      const code = match[1]?.trim().toUpperCase();
      const idd = match[2]?.trim();
      if (!code || !idd || map.has(code)) return;
      map.set(code, idd);
    });
  } catch {
    // Si no se puede leer el directorio de imagenes, se mantiene el flujo normal.
  }

  cardImageCodeToIddCache = map;
  return map;
};

const buildFallbackCard = (entryKey: string): Card | null => {
  const normalizedKey = entryKey.trim().toUpperCase();
  if (!normalizedKey) return null;

  const idd = getCardImageCodeToIddMap().get(normalizedKey);
  if (!idd) return null;

  return {
    id: `fallback-${normalizedKey}`,
    idd,
    code: normalizedKey,
    types: [],
    limit: "",
    rarities: [],
    cost: 0,
    force: "",
    defense: "",
    archetypes: [],
    keywords: [],
    name: normalizedKey,
    effect: "",
    product: {
      code: "",
      name: "No disponible",
      show: false,
      url: "",
    },
    price: null,
  };
};

const parseDeckEntries = (ids: string) => parseEncodedDeckSegment(ids);

const getCardsByIds = async (ids: string) => {
  if (!ids) return [];
  let deck: Decklist[] = [];
  const entries = parseDeckEntries(ids);
  const keys = entries.map((entry) => entry.key);
  const uniqueKeys = Array.from(new Set(keys));

  if (uniqueKeys.length === 0) {
    return [];
  }

  try {
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
        OR: [
          {
            idd: {
              in: uniqueKeys,
            },
          },
          {
            code: {
              in: uniqueKeys,
            },
          },
        ],
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
      const fallbackCard = !card ? buildFallbackCard(entry.key) : null;
      if (!card && !fallbackCard) return;

      deck = [
        ...deck,
        {
          card: card
            ? {
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
              }
            : (fallbackCard as Card),
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

  const normalizedIds = normalizeEncodedDecklist(ids);
  if (!normalizedIds || hasRawDecklistSeparators(normalizedIds)) {
    // Aceptamos exclusivamente separadores ASCII codificados (%3A/%3B/%7C).
    return { mainDeck: [], sideDeck: [] };
  }

  // Dividimos en [main, side] con el separador codificado.
  const [mainIds = "", sideIds = ""] = normalizedIds.split(
    ENCODED_SECTION_SEPARATOR,
  );

  // Ejecutamos en paralelo
  const [mainDeck, sideDeck] = await Promise.all([
    getCardsByIds(mainIds),
    getCardsByIds(sideIds),
  ]);

  return { mainDeck, sideDeck };
};
