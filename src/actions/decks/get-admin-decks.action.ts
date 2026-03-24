"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { AdminDeckListItem } from "@/interfaces";

export async function getAdminDecksAction(): Promise<AdminDeckListItem[]> {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin") {
      return [];
    }

    const decks = await prisma.deck.findMany({
      where: {
        isAdminDeck: true,
        user: {
          role: "admin",
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        cardsNumber: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            lastname: true,
            nickname: true,
          },
        },
        archetype: {
          select: {
            name: true,
          },
        },
      },
    });

    return decks.map((deck) => ({
      id: deck.id,
      name: deck.name,
      cardsNumber: deck.cardsNumber,
      createdAt: deck.createdAt.toISOString(),
      archetypeName: deck.archetype?.name ?? null,
      authorName: deck.user
        ? `${deck.user.name ?? ""} ${deck.user.lastname ?? ""}`.trim() ||
          deck.user.nickname
        : null,
      userNickname: deck.user?.nickname ?? null,
    }));
  } catch (error) {
    console.error("[getAdminDecksAction]", error);
    throw new Error("Error cargando mazos admin");
  }
}
