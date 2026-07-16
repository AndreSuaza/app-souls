"use server";

import { prisma } from "@/lib/prisma";
import { CardSlugSchema, type CardSlugInput } from "@/schemas";
import { normalizeCardSlug } from "@/utils/card-slug";

const cardDetailSelect = {
  id: true,
  idd: true,
  code: true,
  name: true,
  slug: true,
  imageUrl: true,
  cost: true,
  force: true,
  defense: true,
  limit: true,
  effect: true,
  price: true,
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
  archetypes: {
    select: {
      name: true,
    },
  },
  rarities: {
    select: {
      name: true,
    },
  },
  keywords: {
    select: {
      name: true,
    },
  },
} as const;

const safeDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const getLegacySlugParts = (slug: string) => {
  const match = /^(.+)-([a-z]+)-(\d+(?:-\d+)?)$/.exec(slug);

  if (!match) return null;
  const [cardNumber, idd] = match[3].split("-");

  return {
    nameSlug: match[1],
    productCode: match[2].toUpperCase(),
    cardCode: `${match[2].toUpperCase()}-${cardNumber}`,
    idd,
  };
};

export async function getBovedaCardDetailAction(input: CardSlugInput) {
  const { slug } = CardSlugSchema.parse(input);
  const decodedSlug = safeDecodeURIComponent(slug).trim();
  const normalizedSlug = normalizeCardSlug(decodedSlug);

  let card = await prisma.card.findUnique({
    where: { slug },
    select: cardDetailSelect,
  });

  if (!card && decodedSlug !== slug) {
    card = await prisma.card.findUnique({
      where: { slug: decodedSlug },
      select: cardDetailSelect,
    });
  }

  if (!card && normalizedSlug !== slug) {
    card = await prisma.card.findUnique({
      where: { slug: normalizedSlug },
      select: cardDetailSelect,
    });
  }

  if (!card) {
    const legacyParts = getLegacySlugParts(normalizedSlug);

    if (legacyParts) {
      // Compatibilidad con URLs antiguas o mal codificadas que conservan nombre + producto.
      card = await prisma.card.findFirst({
        where: {
          code: legacyParts.cardCode,
          ...(legacyParts.idd ? { idd: legacyParts.idd } : {}),
          product: {
            code: legacyParts.productCode,
          },
        },
        select: cardDetailSelect,
        orderBy: {
          idd: "asc",
        },
      });
    }
  }

  if (!card) {
    const legacyParts = getLegacySlugParts(normalizedSlug);

    if (legacyParts) {
      card = await prisma.card.findFirst({
        where: {
          slug: {
            startsWith: `${legacyParts.nameSlug}-`,
          },
        },
        select: cardDetailSelect,
        orderBy: {
          idd: "asc",
        },
      });
    }
  }

  if (!card) {
    card = await prisma.card.findUnique({
      where: { slug: normalizedSlug },
      select: cardDetailSelect,
    });
  }

  if (!card) return null;

  const relatedProducts = await prisma.card.findMany({
    where: {
      idd: card.idd,
    },
    select: {
      product: {
        select: {
          name: true,
          code: true,
          show: true,
          url: true,
        },
      },
    },
  });

  // Prioriza el producto principal y elimina duplicados por codigo.
  const uniqueProducts = new Map(
    relatedProducts.map((item) => [item.product.code, item.product]),
  );
  uniqueProducts.set(card.product.code, card.product);

  return {
    ...card,
    relatedProducts: Array.from(uniqueProducts.values()),
  };
}
