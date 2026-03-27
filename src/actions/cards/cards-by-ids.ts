"use server";

import { Card } from "@/interfaces";
import { prisma } from "@/lib/prisma";

export interface Decklist {
  count: number;
  card: Card;
}

type DeckPair = { token: string; count: number };

const safeDecodeToken = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (!trimmed.includes("%")) return trimmed;
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
};

const parseLegacyDecklist = (segment: string): DeckPair[] => {
  if (!segment) return [];
  const tokens = segment
    .split(/%2C|,/gi)
    .map((token) => safeDecodeToken(token))
    .filter(Boolean);

  const pairs: DeckPair[] = [];
  for (let index = 0; index < tokens.length; index += 2) {
    const token = tokens[index]?.trim();
    if (!token) continue;
    // Convierte el decklist legacy "token,cantidad" a pares estructurados.
    const countValue = Number.parseInt(tokens[index + 1] ?? "0");
    pairs.push({
      token,
      count: Number.isNaN(countValue) ? 0 : countValue,
    });
  }

  return pairs;
};

const parseDecklist = (segment: string): DeckPair[] => {
  if (!segment) return [];

  // Nuevo formato: code:count;code:count; (compat con codigos que contienen comas).
  if (segment.includes(";") || segment.includes(":")) {
    const pairs: DeckPair[] = [];
    segment
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => {
        const [rawCode = "", rawCount = ""] = item.split(":");
        const token = safeDecodeToken(rawCode);
        if (!token) return;
        const countValue = Number.parseInt(rawCount ?? "0");
        pairs.push({
          token,
          count: Number.isNaN(countValue) ? 0 : countValue,
        });
      });
    return pairs;
  }

  return parseLegacyDecklist(segment);
};

const getCardsByIds = async (ids: string) => {
  if (!ids) return [];
  let deck: Decklist[] = [];
  const pairs = parseDecklist(ids);
  const tokens = pairs.map((pair) => pair.token);

  try {
    const cards = await prisma.card.findMany({
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
        OR: [{ code: { in: tokens } }, { idd: { in: tokens } }],
      },
    });

    const iddMap = new Map<string, (typeof cards)[number]>();
    const codeMap = new Map<string, (typeof cards)[number]>();
    cards.forEach((card) => {
      if (!iddMap.has(card.idd)) {
        iddMap.set(card.idd, card);
      }
      if (!codeMap.has(card.code)) {
        codeMap.set(card.code, card);
      }
    });

    pairs.forEach((pair) => {
      const card = codeMap.get(pair.token) ?? iddMap.get(pair.token);
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
          count: pair.count,
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

  // Normalizamos solo el separador del sideboard para no romper codigos con comas.
  const normalizedIds = ids.includes("%7C")
    ? ids.replace(/%7C/gi, "|")
    : ids;

  // Dividimos en [main, side]
  const [mainIds = "", sideIds = ""] = normalizedIds.split("|");

  // Ejecutamos en paralelo
  const [mainDeck, sideDeck] = await Promise.all([
    getCardsByIds(mainIds),
    getCardsByIds(sideIds),
  ]);

  return { mainDeck, sideDeck };
};
