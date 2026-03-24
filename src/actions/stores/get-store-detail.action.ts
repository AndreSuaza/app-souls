"use server";

import { prisma } from "@/lib/prisma";
import { StoreSlugSchema } from "@/schemas";
import type { StoreDetailResponse } from "@/interfaces";

interface Input {
  storeSlug: string;
}

export async function getStoreDetailAction(
  input: Input,
): Promise<StoreDetailResponse | null> {
  const storeSlug = StoreSlugSchema.parse(input.storeSlug);

  try {
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        address: true,
        country: true,
        postalCode: true,
        phone: true,
        lat: true,
        lgn: true,
        url: true,
      },
    });

    if (!store) return null;

    const storeId = store.id;
    const tournaments = await prisma.tournament.findMany({
      where: { storeId, status: "pending" },
      orderBy: { date: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
      },
    });

    return {
      store,
      tournaments: tournaments.map((tournament) => ({
        ...tournament,
        date: tournament.date.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[getStoreDetailAction]", error);
    throw new Error("Error cargando la tienda");
  }
}
