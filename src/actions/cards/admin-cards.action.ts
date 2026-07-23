"use server";

import sharp from "sharp";
import { auth } from "@/auth";
import { uploadAsset } from "@/lib/assets-storage";
import { prisma } from "@/lib/prisma";
import {
  AdminCardsFiltersSchema,
  CreateAdminCardSchema,
  DeleteAdminCardSchema,
  UpdateAdminCardSchema,
  UploadCardImageSchema,
  type AdminCardsFiltersInput,
  type CreateAdminCardInput,
  type DeleteAdminCardInput,
  type UpdateAdminCardInput,
} from "@/schemas";
import { buildCardImageKey } from "@/utils/card-image";
import { toAssetUrl } from "@/utils/asset-path";
import { buildCardSlug } from "@/utils/card-slug";
import type { Prisma } from "@prisma/client";
import { activeCardWhere } from "./card-status";

const ensureAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }
};

const cardAdminSelect = {
  id: true,
  idd: true,
  code: true,
  limit: true,
  rotation: true,
  cost: true,
  force: true,
  defense: true,
  name: true,
  slug: true,
  effect: true,
  imageUrl: true,
  price: true,
  status: true,
  productId: true,
  typeIds: true,
  archetypesIds: true,
  keywordsIds: true,
  raritiesIds: true,
  product: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  types: {
    select: {
      id: true,
      name: true,
    },
  },
  archetypes: {
    select: {
      id: true,
      name: true,
    },
  },
  keywords: {
    select: {
      id: true,
      name: true,
    },
  },
  rarities: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const normalizeStatus = (status?: "active" | "deleted" | null) =>
  status ?? "active";

const addImageCacheVersion = (pathname: string) =>
  `${pathname}?v=${Date.now()}`;

const toAdminCard = (
  card: Prisma.CardGetPayload<{ select: typeof cardAdminSelect }>,
) => ({
  ...card,
  status: normalizeStatus(card.status),
  price: card.price ?? null,
});

const buildAdminWhere = (
  input: AdminCardsFiltersInput,
): Prisma.CardWhereInput => {
  const and: Prisma.CardWhereInput[] = [];
  const text = input.text?.trim();

  if (input.status === "active") {
    and.push(activeCardWhere());
  } else if (input.status === "deleted") {
    and.push({ status: "deleted" });
  }

  if (text) {
    and.push({
      OR: [
        { effect: { contains: text, mode: "insensitive" } },
        { idd: { equals: text, mode: "insensitive" } },
        { code: { contains: text, mode: "insensitive" } },
        { name: { contains: text, mode: "insensitive" } },
      ],
    });
  }

  if (input.productId) and.push({ productId: input.productId });
  if (input.rarityId) and.push({ raritiesIds: { has: input.rarityId } });
  if (input.typeId) and.push({ typeIds: { has: input.typeId } });
  if (input.archetypeId) and.push({ archetypesIds: { has: input.archetypeId } });
  if (input.keywordId) and.push({ keywordsIds: { has: input.keywordId } });
  if (input.rotation !== undefined) and.push({ rotation: input.rotation });
  if (input.image === "missing") {
    and.push({ OR: [{ imageUrl: null }, { imageUrl: "" }] });
  }

  return and.length ? { AND: and } : {};
};

const ensureReferencesExist = async (input: {
  productId: string;
  typeIds: string[];
  archetypesIds: string[];
  keywordsIds: string[];
  raritiesIds: string[];
}) => {
  const [product, typeCount, archetypeCount, keywordCount, rarityCount] =
    await Promise.all([
      prisma.product.findUnique({
        where: { id: input.productId },
        select: { id: true },
      }),
      prisma.type.count({ where: { id: { in: input.typeIds } } }),
      input.archetypesIds.length
        ? prisma.archetype.count({ where: { id: { in: input.archetypesIds } } })
        : Promise.resolve(0),
      input.keywordsIds.length
        ? prisma.keyword.count({ where: { id: { in: input.keywordsIds } } })
        : Promise.resolve(0),
      prisma.rarity.count({ where: { id: { in: input.raritiesIds } } }),
    ]);

  if (!product) throw new Error("El producto seleccionado no existe");
  if (typeCount !== input.typeIds.length) {
    throw new Error("Uno o mas tipos seleccionados no existen");
  }
  if (archetypeCount !== input.archetypesIds.length) {
    throw new Error("Uno o mas arquetipos seleccionados no existen");
  }
  if (keywordCount !== input.keywordsIds.length) {
    throw new Error("Una o mas keywords seleccionadas no existen");
  }
  if (rarityCount !== input.raritiesIds.length) {
    throw new Error("Una o mas rarezas seleccionadas no existen");
  }
};

const assertUniqueCard = async ({
  cardId,
  code,
  idd,
  slug,
}: {
  cardId?: string;
  code: string;
  idd: string;
  slug: string;
}) => {
  const conflict = await prisma.card.findFirst({
    where: {
      ...(cardId ? { NOT: { id: cardId } } : {}),
      OR: [{ code }, { slug }, { AND: [{ code }, { idd }] }],
    },
    select: {
      code: true,
      slug: true,
      idd: true,
    },
  });

  if (!conflict) return;
  if (conflict.code === code) throw new Error("El codigo de la carta ya existe");
  if (conflict.slug === slug) throw new Error("El slug de la carta ya existe");
  throw new Error("Ya existe una carta con la misma combinacion de codigo y numeracion");
};

const toCardData = (
  input: CreateAdminCardInput | UpdateAdminCardInput,
  imageUrl?: string,
) => ({
  idd: input.idd,
  code: input.code,
  limit: input.limit,
  rotation: input.rotation,
  cost: input.cost,
  force: input.force,
  defense: input.defense,
  name: input.name,
  slug: buildCardSlug(input.name, input.code),
  effect: input.effect,
  price: input.price,
  productId: input.productId,
  typeIds: input.typeIds,
  archetypesIds: input.archetypesIds,
  keywordsIds: input.keywordsIds,
  raritiesIds: input.raritiesIds,
  ...(imageUrl !== undefined ? { imageUrl } : {}),
});

export async function getAdminCardPropertiesAction() {
  await ensureAdmin();

  const [products, types, archetypes, keywords, rarities] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, name: true, code: true },
      orderBy: [{ name: "asc" }],
    }),
    prisma.type.findMany({ select: { id: true, name: true }, orderBy: [{ name: "asc" }] }),
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

  return { products, types, archetypes, keywords, rarities };
}

export async function getAdminCardsAction(input: unknown = {}) {
  await ensureAdmin();
  const filters = AdminCardsFiltersSchema.parse(input);
  const where = buildAdminWhere(filters);

  const [cards, totalCount] = await Promise.all([
    prisma.card.findMany({
      where,
      select: cardAdminSelect,
      orderBy: [{ id: "desc" }],
      take: filters.take,
      skip: (filters.page - 1) * filters.take,
    }),
    prisma.card.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / filters.take));

  return {
    cards: cards.map(toAdminCard),
    totalCount,
    totalPages,
    currentPage: Math.min(filters.page, totalPages),
    perPage: filters.take,
  };
}

export async function getAdminCardByIdAction(input: DeleteAdminCardInput) {
  await ensureAdmin();
  const { cardId } = DeleteAdminCardSchema.parse(input);

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: cardAdminSelect,
  });

  return card ? toAdminCard(card) : null;
}

export async function uploadCardImageAction(formData: FormData) {
  await ensureAdmin();

  const parsed = UploadCardImageSchema.parse({
    code: formData.get("code"),
    idd: formData.get("idd"),
  });
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("Archivo invalido");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten imagenes");
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error("La imagen supera el limite de 6MB");
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const outputBuffer = await sharp(inputBuffer).webp({ quality: 88 }).toBuffer();
  const path = buildCardImageKey(parsed.code, parsed.idd);

  const asset = await uploadAsset({
    path,
    buffer: outputBuffer,
    contentType: "image/webp",
  });
  const versionedPathname = addImageCacheVersion(asset.pathname);

  return { pathname: versionedPathname, url: toAssetUrl(versionedPathname) };
}

export async function createCardAction(input: CreateAdminCardInput) {
  await ensureAdmin();
  const data = CreateAdminCardSchema.parse(input);
  const slug = buildCardSlug(data.name, data.code);

  await ensureReferencesExist(data);
  await assertUniqueCard({ code: data.code, idd: data.idd, slug });

  const card = await prisma.card.create({
    data: {
      ...toCardData(data, data.imageUrl),
      status: "active",
    },
    select: { id: true },
  });

  return card.id;
}

export async function updateCardAction(input: UpdateAdminCardInput) {
  await ensureAdmin();
  const data = UpdateAdminCardSchema.parse(input);
  const existing = await prisma.card.findUnique({
    where: { id: data.cardId },
    select: { id: true, imageUrl: true },
  });

  if (!existing) throw new Error("Carta no encontrada");

  const slug = buildCardSlug(data.name, data.code);
  await ensureReferencesExist(data);
  await assertUniqueCard({
    cardId: data.cardId,
    code: data.code,
    idd: data.idd,
    slug,
  });

  await prisma.card.update({
    where: { id: data.cardId },
    data: {
      ...toCardData(data, data.imageUrl || existing.imageUrl || undefined),
      status: "active",
    },
  });
}

export async function deleteCardAction(input: DeleteAdminCardInput) {
  await ensureAdmin();
  const { cardId } = DeleteAdminCardSchema.parse(input);

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { id: true, status: true },
  });

  if (!card) throw new Error("Carta no encontrada");

  await prisma.card.update({
    where: { id: cardId },
    data: { status: "deleted" },
  });
}
