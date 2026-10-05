import { prisma } from "@/lib/prisma";
import { USER_DECK_LIMIT, countMainDeckCards } from "@/lib/deck-management";
import { toSimulatorDeckDto } from "@/lib/simulator-deck";
import type { SimulatorTokenPayload } from "@/lib/simulator-token";
import { resolveCardImageUrl } from "@/utils/card-image";
import {
  ENCODED_SECTION_SEPARATOR,
  hasRawDecklistSeparators,
  normalizeEncodedDecklist,
  parseEncodedDeckSegment,
} from "@/utils/decklist";
import { activeCardWhere } from "@/actions/cards/card-status";
import type { Prisma } from "@prisma/client";

const mongoObjectIdPattern = /^[a-f\d]{24}$/i;
const trailingMongoObjectIdPattern = /-([a-f\d]{24})$/i;

type LabCardSource = {
  archetypes: { id?: string; name: string }[];
  code: string;
  cost: number;
  defense: string;
  effect: string;
  force: string;
  id: string;
  idd: string;
  imageUrl?: string | null;
  keywords: { id?: string; name: string }[];
  limit: string;
  name: string;
  price?: number | null;
  product?: { code: string; name: string; show: boolean; url: string } | null;
  rarities: { id?: string; name: string }[];
  relatedProducts?: { code: string; name: string; show: boolean; url: string }[];
  slug?: string | null;
  types: { id?: string; name: string }[];
};

const property = (item: { id?: string; name: string }) => ({
  id: item.id ?? item.name,
  name: item.name.trim() || item.id || "Sin nombre",
});

export const toDeckLabCardDto = (card: LabCardSource) => ({
  archetypes: card.archetypes.map(property),
  code: card.code,
  cost: card.cost,
  ...(card.defense ? { defense: card.defense } : {}),
  effect: card.effect,
  ...(card.force ? { force: card.force } : {}),
  id: card.id,
  idd: card.idd,
  imageUrl: resolveCardImageUrl(card),
  keywords: card.keywords.map(property),
  ...(card.limit ? { limit: card.limit } : {}),
  name: card.name,
  price: card.price ?? null,
  ...(card.product
    ? {
        product: {
          code: card.product.code,
          name: card.product.name,
          show: card.product.show,
          url: card.product.url,
        },
      }
    : {}),
  rarities: card.rarities.map(property),
  relatedProducts: card.relatedProducts ?? [],
  ...(card.slug ? { slug: card.slug } : {}),
  types: card.types.map(property),
});

async function loadRelatedProductsByIdd(idds: string[]) {
  const uniqueIdds = Array.from(new Set(idds.filter(Boolean)));
  if (uniqueIdds.length === 0) return new Map<string, LabCardSource["relatedProducts"]>();

  const productsByIdd = new Map<string, NonNullable<LabCardSource["relatedProducts"]>>();
  const cards = await prisma.card.findMany({
    select: {
      idd: true,
      product: {
        select: {
          code: true,
          name: true,
          show: true,
          status: true,
          url: true,
        },
      },
    },
    where: {
      AND: [activeCardWhere(), { idd: { in: uniqueIdds } }],
    },
  });

  cards.forEach((card) => {
    const product = card.product;
    if (!product.show || product.status === "deleted") return;
    const current = productsByIdd.get(card.idd) ?? [];
    if (!current.some((item) => item.code === product.code)) {
      current.push({
        code: product.code,
        name: product.name,
        show: product.show,
        url: product.url,
      });
    }
    productsByIdd.set(card.idd, current);
  });

  return productsByIdd;
}

export type DeckLabFilters = {
  archetypes?: string;
  costs?: string;
  defenses?: string;
  forces?: string;
  keywords?: string;
  limit?: string;
  page?: number;
  products?: string;
  rarities?: string;
  take?: number;
  text?: string;
  types?: string;
};

const splitCsv = (value?: string) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const buildCardWhere = (filters: DeckLabFilters): Prisma.CardWhereInput => {
  const where: Prisma.CardWhereInput = {};

  const products = splitCsv(filters.products);
  if (products.length > 0) {
    where.product = { code: { in: products } };
  }

  const types = splitCsv(filters.types);
  if (types.length > 0) {
    where.typeIds = { hasEvery: types };
  }

  const archetypes = splitCsv(filters.archetypes);
  if (archetypes.length > 0) {
    where.archetypesIds = { hasEvery: archetypes };
  }

  const keywords = splitCsv(filters.keywords);
  if (keywords.length > 0) {
    where.keywordsIds = { hasEvery: keywords };
  }

  const costs = splitCsv(filters.costs)
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isFinite(item));
  if (costs.length > 0) {
    where.cost = { in: costs };
  }

  const forces = splitCsv(filters.forces);
  if (forces.length > 0) {
    where.force = { in: forces };
  }

  const defenses = splitCsv(filters.defenses);
  if (defenses.length > 0) {
    where.defense = { in: defenses };
  }

  const rarities = splitCsv(filters.rarities);
  if (rarities.length > 0) {
    where.raritiesIds = { hasEvery: rarities };
  }

  const limits = splitCsv(filters.limit);
  if (limits.length > 0) {
    where.limit = { in: limits };
  }

  const text = filters.text?.trim();
  if (text) {
    where.OR = [
      { effect: { contains: text, mode: "insensitive" } },
      { idd: { equals: text, mode: "insensitive" } },
      { name: { contains: text, mode: "insensitive" } },
    ];
  }

  return { AND: [activeCardWhere(), where] };
};

export async function loadDeckLabCards(filters: DeckLabFilters = {}) {
  const page = Math.max(1, Number.isFinite(filters.page) ? Math.trunc(filters.page ?? 1) : 1);
  const take = Math.min(60, Math.max(12, Number.isFinite(filters.take) ? Math.trunc(filters.take ?? 24) : 24));
  const where = buildCardWhere(filters);

  const [cards, totalCount] = await Promise.all([
    prisma.card.findMany({
      take,
      skip: (page - 1) * take,
      include: {
        archetypes: { select: { id: true, name: true } },
        keywords: { select: { id: true, name: true } },
        product: { select: { code: true, name: true, show: true, url: true } },
        rarities: { select: { id: true, name: true } },
        types: { select: { id: true, name: true } },
      },
      where,
      orderBy: [{ id: "desc" }],
    }),
    prisma.card.count({ where }),
  ]);

  const relatedProducts = await loadRelatedProductsByIdd(cards.map((card) => card.idd));

  return {
    cards: cards.map((card) =>
      toDeckLabCardDto({
        ...card,
        price: card.price ?? null,
        relatedProducts: relatedProducts.get(card.idd) ?? [],
      }),
    ),
    currentPage: page,
    perPage: take,
    totalCards: totalCount,
    totalPages: Math.ceil(totalCount / take),
  };
}

export async function loadDeckLabProperties() {
  const [products, types, archetypes, keywords, rarities] = await Promise.all([
    prisma.product.findMany({
      select: { code: true, name: true },
      orderBy: [{ createDate: "desc" }],
    }),
    prisma.type.findMany({
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }],
    }),
    prisma.archetype.findMany({
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }],
    }),
    prisma.keyword.findMany({
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }],
    }),
    prisma.rarity.findMany({
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  return {
    products: products.map((product) => ({ id: product.code, name: product.name.trim() || product.code || "Sin nombre" })),
    rarities: rarities.map((item) => ({ id: item.id, name: item.name.trim() || item.id || "Sin nombre" })),
    types: types.map((item) => ({ id: item.id, name: item.name.trim() || item.id || "Sin nombre" })),
    archetypes: archetypes.map((item) => ({ id: item.id, name: item.name.trim() || item.id || "Sin nombre" })),
    keywords: keywords.map((item) => ({ id: item.id, name: item.name.trim() || item.id || "Sin nombre" })),
  };
}

type OwnedDeckSource = {
  archetypeId?: string | null;
  cards: string;
  cardsNumber?: number | null;
  description?: string | null;
  id: string;
  imagen?: string | null;
  name: string;
  tokenCards?: string | null;
  tokenCardsNumber?: number | null;
  updatedAt?: Date;
  visible?: boolean | null;
};

export const toDeckLabSummary = (deck: OwnedDeckSource) => {
  const mainDeckCount = deck.cardsNumber ?? countMainDeckCards(deck.cards);
  const tokenDeckCount =
    deck.tokenCardsNumber ??
    parseEncodedDeckSegment(deck.tokenCards ?? "").reduce(
      (total, entry) => total + entry.count,
      0,
    );

  return {
    ...(deck.archetypeId ? { archetypeId: deck.archetypeId } : {}),
    canDelete: true,
    canEdit: true,
    description: deck.description ?? null,
    id: deck.id,
    imageKey: deck.imagen ?? null,
    mainDeckCount,
    name: deck.name,
    playable: mainDeckCount >= 40,
    tokenDeckCount,
    ...(deck.updatedAt ? { updatedAt: deck.updatedAt.toISOString() } : {}),
    visible: Boolean(deck.visible),
  };
};

export async function loadOwnedDeckLabSummaries(session: SimulatorTokenPayload) {
  const decks = await prisma.deck.findMany({
    where: {
      userId: session.userId,
      AND: [
        { OR: [{ isAdminDeck: false }, { isAdminDeck: { isSet: false } }] },
      ],
    },
    select: {
      archetypeId: true,
      cards: true,
      cardsNumber: true,
      description: true,
      id: true,
      imagen: true,
      name: true,
      tokenCards: true,
      tokenCardsNumber: true,
      updatedAt: true,
      visible: true,
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return decks.map(toDeckLabSummary);
}

const expandCardLookupKeys = (keys: string[]) =>
  Array.from(
    new Set(
      keys.flatMap((key) => {
        const trimmedKey = key.trim();
        if (!trimmedKey) return [];
        const trailingObjectId = trailingMongoObjectIdPattern.exec(trimmedKey)?.[1];
        return [
          trimmedKey,
          ...(trailingObjectId
            ? [trailingObjectId, trimmedKey.slice(0, -trailingObjectId.length - 1)]
            : []),
        ].filter(Boolean);
      }),
    ),
  );

async function loadLabEntries(rawDecklist?: string | null) {
  const normalized = normalizeEncodedDecklist(rawDecklist ?? "");
  if (!normalized || hasRawDecklistSeparators(normalized)) return [];

  const entries = parseEncodedDeckSegment(normalized);
  const keys = Array.from(new Set(entries.map((entry) => entry.key)));
  if (keys.length === 0) return [];

  const cards = await prisma.card.findMany({
    include: {
      archetypes: { select: { id: true, name: true } },
      keywords: { select: { id: true, name: true } },
      product: { select: { code: true, name: true, show: true, url: true } },
      rarities: { select: { id: true, name: true } },
      types: { select: { id: true, name: true } },
    },
    where: {
      AND: [
        activeCardWhere(),
        {
          OR: [{ code: { in: keys } }, { idd: { in: keys } }],
        },
      ],
    },
  });

  const cardByKey = new Map<string, (typeof cards)[number]>();
  cards.forEach((card) => {
    cardByKey.set(card.code, card);
    cardByKey.set(card.idd, card);
  });

  const relatedProducts = await loadRelatedProductsByIdd(cards.map((card) => card.idd));

  return entries.flatMap((entry) => {
    const card = cardByKey.get(entry.key);
    if (!card) return [];
    return [
      {
        card: toDeckLabCardDto({
          ...card,
          price: card.price ?? null,
          relatedProducts: relatedProducts.get(card.idd) ?? [],
        }),
        count: entry.count,
      },
    ];
  });
}

export async function loadDeckLabDetail(session: SimulatorTokenPayload, deckId: string) {
  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId: session.userId,
      AND: [{ OR: [{ isAdminDeck: false }, { isAdminDeck: { isSet: false } }] }],
    },
    select: {
      archetypeId: true,
      cards: true,
      cardsNumber: true,
      description: true,
      id: true,
      imagen: true,
      name: true,
      tokenCards: true,
      tokenCardsNumber: true,
      updatedAt: true,
      visible: true,
    },
  });

  if (!deck) return null;

  const normalizedDecklist = normalizeEncodedDecklist(deck.cards);
  const [mainSegment = "", sideSegment = ""] = normalizedDecklist.split(ENCODED_SECTION_SEPARATOR);
  const [mainDeck, sideDeck, tokenDeck] = await Promise.all([
    loadLabEntries(mainSegment),
    loadLabEntries(sideSegment),
    loadLabEntries(deck.tokenCards),
  ]);

  return {
    ...toDeckLabSummary(deck),
    deckList: normalizedDecklist,
    mainDeck,
    sideDeck,
    tokenDeck,
    tokenDeckList: deck.tokenCards ?? "",
  };
}

export async function previewDeckLabDeck(rawDecklist: string, rawTokenDecklist?: string) {
  const normalizedDecklist = normalizeEncodedDecklist(rawDecklist);
  if (!normalizedDecklist || hasRawDecklistSeparators(normalizedDecklist)) {
    return null;
  }

  const [mainSegment = "", sideSegment = ""] = normalizedDecklist.split(ENCODED_SECTION_SEPARATOR);
  const [mainDeck, sideDeck, tokenDeck] = await Promise.all([
    loadLabEntries(mainSegment),
    loadLabEntries(sideSegment),
    loadLabEntries(rawTokenDecklist),
  ]);

  return {
    mainDeck,
    sideDeck,
    tokenDeck,
  };
}

export async function loadPlayableSimulatorDecks(session: SimulatorTokenPayload) {
  const decks = await prisma.deck.findMany({
    where: {
      userId: session.userId,
      cardsNumber: { gte: 40 },
      AND: [{ OR: [{ isAdminDeck: false }, { isAdminDeck: { isSet: false } }] }],
    },
    select: {
      id: true,
      name: true,
      cards: true,
      cardsNumber: true,
      tokenCards: true,
      tokenCardsNumber: true,
      userId: true,
      visible: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const allKeys = Array.from(
    new Set(
      decks.flatMap((deck) => {
        const parsed = toSimulatorDeckDto(deck);
        return [...parsed.mainDeck, ...parsed.soulDeck, ...parsed.limboDeck, ...parsed.tokenDeck].map(
          (entry) => entry.cardId,
        );
      }),
    ),
  );
  const cardKeys = expandCardLookupKeys(allKeys);
  const cardObjectIds = cardKeys.filter((key) => mongoObjectIdPattern.test(key));
  const cards =
    cardKeys.length > 0
      ? await prisma.card.findMany({
          where: {
            OR: [
              { code: { in: cardKeys } },
              { idd: { in: cardKeys } },
              ...(cardObjectIds.length > 0 ? [{ id: { in: cardObjectIds } }] : []),
            ],
          },
          select: {
            id: true,
            code: true,
            name: true,
            typeIds: true,
            cost: true,
            force: true,
            defense: true,
            effect: true,
            imageUrl: true,
            idd: true,
          },
        })
      : [];
  const typeIds = Array.from(new Set(cards.flatMap((card) => card.typeIds)));
  const types =
    typeIds.length > 0
      ? await prisma.type.findMany({
          where: { id: { in: typeIds } },
          select: { id: true, name: true },
        })
      : [];
  const typeById = new Map(types.map((type) => [type.id, type]));

  const simulatorCards = cards.map((card) => ({
    id: card.id,
    idd: card.idd,
    code: card.code,
    name: card.name,
    types: card.typeIds.flatMap((typeId) => {
      const type = typeById.get(typeId);
      return type ? [{ name: type.name }] : [];
    }),
    cost: card.cost,
    force: card.force,
    defense: card.defense,
    effect: card.effect,
    imageUrl: resolveCardImageUrl(card),
  }));

  return decks.map((deck) => toSimulatorDeckDto(deck, simulatorCards));
}

export async function loadDeckLabBootstrap(session: SimulatorTokenPayload, filters: DeckLabFilters = {}) {
  const [properties, cards, decks] = await Promise.all([
    loadDeckLabProperties(),
    loadDeckLabCards(filters),
    loadOwnedDeckLabSummaries(session),
  ]);

  return {
    cards,
    deckLimit: USER_DECK_LIMIT,
    decks,
    properties,
  };
}
