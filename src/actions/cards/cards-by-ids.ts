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
import { activeCardWhere } from "./card-status";

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

type CardViewerOptions = {
  viewerUserId?: string | null;
  ownerUserId?: string | null;
  preserveExclusiveVariants?: boolean;
};

const getCardsByIds = async (ids: string, options: CardViewerOptions = {}) => {
  if (!ids) return [];
  let deck: Decklist[] = [];
  const entries = parseDeckEntries(ids);
  const keys = entries.map((entry) => entry.key);
  const uniqueKeys = Array.from(new Set(keys));
  const accessUserId = options.viewerUserId ?? options.ownerUserId ?? null;

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
        baseCard: {
          include: {
            product: { select: { name: true; code: true; show: true; url: true } };
            types: { select: { name: true } };
            keywords: { select: { name: true } };
            rarities: { select: { name: true; id: true } };
            archetypes: { select: { name: true } };
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
        baseCard: {
          include: {
            product: { select: { name: true, code: true, show: true, url: true } },
            types: { select: { name: true } },
            keywords: { select: { name: true } },
            rarities: { select: { name: true, id: true } },
            archetypes: { select: { name: true } },
          },
        },
      },
      where: {
        AND: [
          activeCardWhere(),
          {
            OR: [
              { idd: { in: uniqueKeys } },
              { code: { in: uniqueKeys } },
              ...(uniqueKeys.some((key) => /^[a-f\d]{24}$/i.test(key))
                ? [{ id: { in: uniqueKeys.filter((key) => /^[a-f\d]{24}$/i.test(key)) } }]
                : []),
            ],
          },
        ],
      },
    });

    const ownedCardIds =
      accessUserId && !options.preserveExclusiveVariants
        ? new Set(
            (
              await prisma.userCardOwnership.findMany({
                where: {
                  userId: accessUserId,
                  unlocked: true,
                  cardId: { in: cards.map((card) => card.id) },
                },
                select: { cardId: true },
              })
            ).map((ownership) => ownership.cardId),
          )
        : new Set<string>();

    const cardByCode = new Map(cards.map((card) => [card.code, card]));
    const cardById = new Map(cards.map((card) => [card.id, card]));
    // Para claves legacy por idd preferimos la versión pública.
    const cardByIdd = new Map<string, (typeof cards)[number]>();
    cards.forEach((card) => {
      const current = cardByIdd.get(card.idd);
      if (!current || (current.access === "OWNED" && card.access !== "OWNED")) {
        cardByIdd.set(card.idd, card);
      }
    });

    entries.forEach((entry) => {
      const card = cardById.get(entry.key) ?? cardByCode.get(entry.key) ?? cardByIdd.get(entry.key);
      const resolvedCard =
        !options.preserveExclusiveVariants &&
        card?.access === "OWNED" &&
        !ownedCardIds.has(card.id)
          ? card.baseCard
          : card;
      const fallbackCard = !resolvedCard ? buildFallbackCard(entry.key) : null;
      if (!resolvedCard && !fallbackCard) return;

      deck = [
        ...deck,
        {
          card: resolvedCard
            ? {
                id: resolvedCard.id,
                idd: resolvedCard.idd,
                code: resolvedCard.code,
                types: resolvedCard.types,
                limit: resolvedCard.limit,
                rarities: resolvedCard.rarities,
                cost: resolvedCard.cost,
                force: resolvedCard.force,
                defense: resolvedCard.defense,
                archetypes: resolvedCard.archetypes,
                keywords: resolvedCard.keywords,
                name: resolvedCard.name,
                effect: resolvedCard.effect,
                imageUrl: resolvedCard.imageUrl ?? null,
                product: resolvedCard.product,
                price: resolvedCard.price ?? null,
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

export const getDecksByIds = async (ids?: string, options: CardViewerOptions = {}) => {
  if (!ids) return { mainDeck: [], sideDeck: [], tokenDeck: [] };

  const normalizedIds = normalizeEncodedDecklist(ids);
  if (!normalizedIds || hasRawDecklistSeparators(normalizedIds)) {
    // Aceptamos exclusivamente separadores ASCII codificados (%3A/%3B/%7C).
    return { mainDeck: [], sideDeck: [], tokenDeck: [] };
  }

  // Dividimos en [main, side] con el separador codificado.
  const [mainIds = "", sideIds = ""] = normalizedIds.split(
    ENCODED_SECTION_SEPARATOR,
  );

  // Ejecutamos en paralelo
  const [mainDeck, sideDeck] = await Promise.all([
    getCardsByIds(mainIds, options),
    getCardsByIds(sideIds, options),
  ]);

  return { mainDeck, sideDeck, tokenDeck: [] };
};

export const getTokenDeckByIds = async (ids?: string | null, options: CardViewerOptions = {}) => {
  if (!ids) return [];

  const normalizedIds = normalizeEncodedDecklist(ids);
  if (!normalizedIds || hasRawDecklistSeparators(normalizedIds)) {
    return [];
  }

  return getCardsByIds(normalizedIds, options);
};
