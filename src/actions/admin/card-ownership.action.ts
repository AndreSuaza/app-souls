"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  AdminBulkCardOwnershipChangeSchema,
  AdminCardOwnershipChangeSchema,
  AdminCardOwnershipHistorySchema,
  AdminCardOwnershipSearchSchema,
} from "@/schemas";
import { activeCardWhere } from "@/actions/cards/card-status";
import {
  ENCODED_SECTION_SEPARATOR,
  normalizeEncodedDecklist,
  parseEncodedDeckSegment,
  serializeEncodedDecklist,
  serializeEncodedDeckSegment,
} from "@/utils/decklist";

const requireAdminSession = async () => {
  const session = await auth();
  if (!session?.user?.idd || session.user.role !== "admin") {
    throw new Error("No tienes permisos para administrar cartas.");
  }
  return { adminId: session.user.idd };
};

const cardSelect = {
  id: true,
  idd: true,
  code: true,
  name: true,
  imageUrl: true,
  access: true,
  baseCardId: true,
  product: { select: { code: true, name: true } },
} as const;

const ensureExclusiveCard = async (cardId: string) => {
  const card = await prisma.card.findFirst({
    where: { id: cardId, AND: [activeCardWhere(), { access: "OWNED" }] },
    select: {
      ...cardSelect,
      baseCard: { select: { id: true, code: true, access: true } },
    },
  });

  if (!card) throw new Error("La variante exclusiva no existe o no esta activa.");
  if (!card.baseCard || card.baseCard.access === "OWNED") {
    throw new Error("La variante no tiene una carta base publica valida.");
  }

  return card;
};

const replaceSegmentKey = (
  segment: string,
  variantKeys: Set<string>,
  baseCode: string,
) =>
  serializeEncodedDeckSegment(
    parseEncodedDeckSegment(segment).map((entry) => ({
      code: variantKeys.has(entry.key) ? baseCode : entry.key,
      count: entry.count,
    })),
  );

const replaceDeckReferences = async (
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
  card: { id: string; code: string; idd: string; baseCard: { code: string } },
) => {
  const decks = await tx.deck.findMany({
    where: { userId },
    select: { id: true, cards: true, tokenCards: true },
  });
  const variantKeys = new Set([card.id, card.code, `${card.code}-${card.idd}`]);

  for (const deck of decks) {
    const normalized = normalizeEncodedDecklist(deck.cards);
    const [main = "", side = ""] = normalized.split(ENCODED_SECTION_SEPARATOR);
    const nextCards = serializeEncodedDecklist(
      parseEncodedDeckSegment(main).map((entry) => ({
        code: variantKeys.has(entry.key) ? card.baseCard.code : entry.key,
        count: entry.count,
      })),
      parseEncodedDeckSegment(side).map((entry) => ({
        code: variantKeys.has(entry.key) ? card.baseCard.code : entry.key,
        count: entry.count,
      })),
    );
    const nextTokenCards = deck.tokenCards
      ? replaceSegmentKey(deck.tokenCards, variantKeys, card.baseCard.code)
      : deck.tokenCards;

    if (nextCards !== deck.cards || nextTokenCards !== deck.tokenCards) {
      await tx.deck.update({
        where: { id: deck.id },
        data: { cards: nextCards, tokenCards: nextTokenCards },
      });
    }
  }
};

export const getAdminUserCardOwnershipAction = async (input: unknown) => {
  await requireAdminSession();
  const parsed = AdminCardOwnershipSearchSchema.parse(input);
  const text = parsed.text.trim();

  const cards = await prisma.card.findMany({
    where: {
      AND: [
        activeCardWhere(),
        { access: "OWNED" },
        ...(text
          ? [
              {
                OR: [
                  { name: { contains: text, mode: "insensitive" as const } },
                  { code: { contains: text, mode: "insensitive" as const } },
                  { idd: { equals: text, mode: "insensitive" as const } },
                  { product: { name: { contains: text, mode: "insensitive" as const } } },
                ],
              },
            ]
          : []),
      ],
    },
    take: parsed.limit,
    orderBy: [{ name: "asc" }, { code: "asc" }],
    select: {
      ...cardSelect,
      userOwnerships: {
        where: { userId: parsed.userId, unlocked: true },
        select: { id: true, note: true, grantedAt: true },
      },
    },
  });

  return cards.map((card) => ({
    ...card,
    owned: card.userOwnerships.length > 0,
    userOwnerships: undefined,
    imageUrl: card.imageUrl ?? null,
    grantedAt: card.userOwnerships[0]?.grantedAt?.toISOString() ?? null,
    note: card.userOwnerships[0]?.note ?? null,
  }));
};

export const getAdminUserCardOwnershipHistoryAction = async (input: unknown) => {
  await requireAdminSession();
  const parsed = AdminCardOwnershipHistorySchema.parse(input);
  const history = await prisma.cardOwnershipAudit.findMany({
    where: { userId: parsed.userId },
    orderBy: { createdAt: "desc" },
    take: parsed.limit,
    select: {
      id: true,
      action: true,
      source: true,
      note: true,
      createdAt: true,
      card: { select: { id: true, code: true, idd: true, name: true } },
      admin: { select: { id: true, nickname: true, email: true } },
    },
  });

  return history.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));
};

export const grantAdminUserCardAction = async (input: unknown) => {
  const { adminId } = await requireAdminSession();
  const parsed = AdminCardOwnershipChangeSchema.parse(input);
  const card = await ensureExclusiveCard(parsed.cardId);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: parsed.userId }, select: { id: true } });
    if (!user) throw new Error("El usuario seleccionado no existe.");

    await tx.userCardOwnership.upsert({
      where: { userId_cardId: { userId: user.id, cardId: card.id } },
      create: {
        userId: user.id,
        cardId: card.id,
        unlocked: true,
        source: "ADMIN",
        note: parsed.note || null,
        grantedById: adminId,
        revokedAt: null,
      },
      update: {
        unlocked: true,
        source: "ADMIN",
        note: parsed.note || null,
        grantedAt: new Date(),
        revokedAt: null,
        grantedById: adminId,
        revokedById: null,
      },
    });
    await tx.cardOwnershipAudit.create({
      data: { userId: user.id, cardId: card.id, adminId, action: "GRANTED", source: "ADMIN", note: parsed.note || null },
    });
  });

  return { ok: true };
};

export const bulkGrantAdminUserCardAction = async (input: unknown) => {
  const { adminId } = await requireAdminSession();
  const parsed = AdminBulkCardOwnershipChangeSchema.parse(input);
  const card = await ensureExclusiveCard(parsed.cardId);

  await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({ where: { id: { in: parsed.userIds } }, select: { id: true } });
    if (users.length !== parsed.userIds.length) throw new Error("Uno o mas usuarios no existen.");

    for (const user of users) {
      await tx.userCardOwnership.upsert({
        where: { userId_cardId: { userId: user.id, cardId: card.id } },
        create: { userId: user.id, cardId: card.id, unlocked: true, source: "ADMIN", note: parsed.note || null, grantedById: adminId },
        update: { unlocked: true, source: "ADMIN", note: parsed.note || null, grantedAt: new Date(), revokedAt: null, grantedById: adminId, revokedById: null },
      });
      await tx.cardOwnershipAudit.create({
        data: { userId: user.id, cardId: card.id, adminId, action: "GRANTED", source: "ADMIN", note: parsed.note || null },
      });
    }
  });

  return { ok: true, affectedCount: parsed.userIds.length };
};

export const revokeAdminUserCardAction = async (input: unknown) => {
  const { adminId } = await requireAdminSession();
  const parsed = AdminCardOwnershipChangeSchema.parse(input);
  const card = await ensureExclusiveCard(parsed.cardId);

  await prisma.$transaction(async (tx) => {
    const ownership = await tx.userCardOwnership.findUnique({
      where: { userId_cardId: { userId: parsed.userId, cardId: card.id } },
      select: { id: true, unlocked: true },
    });
    if (!ownership?.unlocked) throw new Error("El usuario no tiene asignada esta variante.");

    await replaceDeckReferences(tx, parsed.userId, {
      id: card.id,
      code: card.code,
      idd: card.idd,
      baseCard: { code: card.baseCard?.code ?? "" },
    });
    await tx.userCardOwnership.update({
      where: { id: ownership.id },
      data: { unlocked: false, revokedAt: new Date(), revokedById: adminId, note: parsed.note || null },
    });
    await tx.cardOwnershipAudit.create({
      data: { userId: parsed.userId, cardId: card.id, adminId, action: "REVOKED", source: "ADMIN", note: parsed.note || null },
    });
  });

  return { ok: true };
};
