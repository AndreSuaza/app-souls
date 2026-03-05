"use server";

import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DeckSearchSchema, type DeckSearchInput } from "@/schemas";

const isObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

export async function searchAdminDecksAction(input: DeckSearchInput = {}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return {
      decks: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      perPage: 0,
    };
  }

  const { text, take = 24, page = 1 } = DeckSearchSchema.parse(input);
  const currentPage = Math.max(1, page);
  const trimmedText = text?.trim();
  const hasSearch = Boolean(trimmedText);

  const orFilters: Prisma.DeckWhereInput[] = [];

  if (trimmedText) {
    if (isObjectId(trimmedText)) {
      orFilters.push({ id: trimmedText });
    }

    orFilters.push(
      {
        name: {
          contains: trimmedText,
          mode: "insensitive" as Prisma.QueryMode,
        },
      },
      {
        user: {
          nickname: {
            contains: trimmedText,
            mode: "insensitive" as Prisma.QueryMode,
          },
        },
      },
    );
  }

  const where: Prisma.DeckWhereInput = {
    isAdminDeck: true,
    ...(hasSearch ? { OR: orFilters } : {}),
  };

  const totalCount = await prisma.deck.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / take));
  const safePage = Math.min(currentPage, totalPages);

  const decks = await prisma.deck.findMany({
    where,
    take,
    skip: (safePage - 1) * take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      imagen: true,
      cardsNumber: true,
      user: {
        select: {
          nickname: true,
        },
      },
    },
  });

  return {
    decks: decks.map((deck) => ({
      id: deck.id,
      name: deck.name,
      imagen: deck.imagen,
      cardsNumber: deck.cardsNumber,
      userNickname: deck.user?.nickname ?? "",
    })),
    totalCount,
    totalPages,
    currentPage: safePage,
    perPage: take,
  };
}
