import { prisma } from "@/lib/prisma";
import { activeCardWhere } from "@/actions/cards/card-status";
import type { Prisma } from "@prisma/client";

export type CardViewerContext = "lab" | "owner" | "public" | "match";

export const publicCardWhere = (): Prisma.CardWhereInput => ({
  OR: [{ access: "PUBLIC" }, { access: { isSet: false } }],
});

export type CardAccessSource = {
  id: string;
  idd: string;
  code: string;
  access: "PUBLIC" | "OWNED" | null;
  baseCardId: string | null;
  imageUrl: string | null;
  status?: "active" | "deleted" | null;
};

export const accessibleCardWhere = (userId?: string | null): Prisma.CardWhereInput => ({
  OR: [
    publicCardWhere(),
    ...(userId
      ? [
          {
            access: "OWNED" as const,
            userOwnerships: {
              some: { userId, unlocked: true },
            },
          },
        ]
      : []),
  ],
});

export const isCardOwnedBy = async (cardId: string, userId?: string | null) => {
  if (!userId) return false;

  const ownership = await prisma.userCardOwnership.findFirst({
    where: { cardId, userId, unlocked: true },
    select: { id: true },
  });

  return Boolean(ownership);
};

export const cardKeyCandidates = (key: string) => {
  const normalized = key.trim();
  if (!normalized) return [];

  const candidates = [normalized];
  const objectIdMatch = /-([a-f\d]{24})$/i.exec(normalized);
  if (objectIdMatch) {
    candidates.push(objectIdMatch[1]);
    candidates.push(normalized.slice(0, -objectIdMatch[1].length - 1));
  }

  return Array.from(new Set(candidates));
};

export const cardLookupWhere = (keys: string[]): Prisma.CardWhereInput => {
  const expanded = Array.from(new Set(keys.flatMap(cardKeyCandidates)));
  const objectIds = expanded.filter((key) => /^[a-f\d]{24}$/i.test(key));

  return {
    AND: [
      activeCardWhere(),
      {
        OR: [
          { code: { in: expanded } },
          { idd: { in: expanded } },
          ...(objectIds.length > 0 ? [{ id: { in: objectIds } }] : []),
        ],
      },
    ],
  };
};

const cardAccessSelect = {
  id: true,
  idd: true,
  code: true,
  access: true,
  baseCardId: true,
  imageUrl: true,
  status: true,
} as const;

export const loadCardsForViewer = async (
  keys: string[],
  userId?: string | null,
) => {
  const uniqueKeys = Array.from(new Set(keys.flatMap(cardKeyCandidates)));
  if (uniqueKeys.length === 0) return [];

  return prisma.card.findMany({
    where: {
      AND: [cardLookupWhere(uniqueKeys), accessibleCardWhere(userId)],
    },
    select: cardAccessSelect,
  });
};

export const loadPublicFallback = async (card: CardAccessSource) => {
  if (card.access !== "OWNED") return card;

  if (card.baseCardId) {
    const base = await prisma.card.findFirst({
      where: { id: card.baseCardId, AND: [activeCardWhere(), publicCardWhere()] },
      select: cardAccessSelect,
    });
    if (base) return base;
  }

  return prisma.card.findFirst({
    where: { AND: [activeCardWhere(), publicCardWhere(), { idd: card.idd }] },
    orderBy: { id: "asc" },
    select: cardAccessSelect,
  });
};

export const resolveCardForViewer = async <T extends CardAccessSource>(
  card: T,
  userId: string | null | undefined,
  context: CardViewerContext,
) => {
  if (card.access !== "OWNED" || context === "match") return card;
  if (context === "owner" || context === "lab") {
    return (await isCardOwnedBy(card.id, userId)) ? card : loadPublicFallback(card);
  }
  return loadPublicFallback(card);
};

export const resolveCardsForViewer = async <T extends CardAccessSource>(
  cards: T[],
  userId: string | null | undefined,
  context: CardViewerContext,
) => {
  const resolved = await Promise.all(
    cards.map((card) => resolveCardForViewer(card, userId, context)),
  );

  return resolved.filter((card): card is T => Boolean(card));
};

export const assertCardRulesMatchBase = async ({
  card,
  baseCardId,
}: {
  card: {
    idd: string;
    cost: number;
    force: string;
    defense: string;
    effect: string;
    limit: string;
    typeIds: string[];
    archetypesIds: string[];
    keywordsIds: string[];
  };
  baseCardId: string;
}) => {
  const [base] = await Promise.all([
    prisma.card.findUnique({
      where: { id: baseCardId },
      select: { idd: true, access: true, cost: true, force: true, defense: true, effect: true, limit: true, typeIds: true, archetypesIds: true, keywordsIds: true },
    }),
  ]);

  if (!base) throw new Error("La carta base no existe.");
  if (base.access === "OWNED") throw new Error("La carta base debe ser publica.");

  const sameRules =
    card.idd === base.idd &&
    card.cost === base.cost &&
    card.force === base.force &&
    card.defense === base.defense &&
    card.effect === base.effect &&
    card.limit === base.limit &&
    JSON.stringify(card.typeIds) === JSON.stringify(base.typeIds) &&
    JSON.stringify(card.archetypesIds) === JSON.stringify(base.archetypesIds) &&
    JSON.stringify(card.keywordsIds) === JSON.stringify(base.keywordsIds);

  if (!sameRules) {
    throw new Error("La variante debe compartir exactamente las reglas de la carta base.");
  }
};

export const assertCardVariantMatchesBase = async ({
  cardId,
  baseCardId,
}: {
  cardId: string;
  baseCardId: string;
}) => {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { idd: true, cost: true, force: true, defense: true, effect: true, limit: true, typeIds: true, archetypesIds: true, keywordsIds: true },
  });
  if (!card) throw new Error("La variante no existe.");
  return assertCardRulesMatchBase({ card, baseCardId });
};
