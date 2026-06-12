"use server";

import { auth } from "@/auth";
import { PLAYER_PROFILE_FRAMES_ENABLED } from "@/config/features";
import { prisma } from "@/lib/prisma";

const getCurrentSeasonNumber = async () => {
  const latestSeason = await prisma.eloSeasonHistory.findFirst({
    orderBy: { seasonNumber: "desc" },
    select: { seasonNumber: true },
  });

  return (latestSeason?.seasonNumber ?? 0) + 1;
};

export type CosmeticStoreItem = {
  id: string;
  name: string;
  imageUrl: string;
  type: "AVATAR" | "BANNER" | "FRAME";
  rarity: string;
  availability: string | null;
  price: number;
  storeVisible: boolean;
  isSeasonal: boolean;
  seasonNumber: number | null;
  featured: boolean;
  featuredOrder: number;
  createdAt: string;
  owned: boolean;
};

export type CosmeticStoreData = {
  isAuthenticated: boolean;
  victoryPoints: number;
  currentSeasonNumber: number;
  featured: CosmeticStoreItem[];
  items: CosmeticStoreItem[];
};

export const getCosmeticStoreDataAction =
  async (): Promise<CosmeticStoreData> => {
    const session = await auth();
    const now = new Date();
    const currentSeasonNumber = await getCurrentSeasonNumber();

    const email = session?.user?.email ?? null;
    const user = email
      ? await prisma.user.findUnique({
          where: { email },
          select: { id: true, victoryPoints: true },
        })
      : null;

    const items = await prisma.avatar.findMany({
      where: {
        availability: "STORE",
        ...(PLAYER_PROFILE_FRAMES_ENABLED
          ? {}
          : { type: { not: "FRAME" as const } }),
        OR: [{ storeVisible: true }, { storeVisible: null }],
        AND: [
          {
            OR: [
              { isSeasonal: false },
              { isSeasonal: null },
              {
                isSeasonal: true,
                seasonNumber: currentSeasonNumber,
                OR: [{ seasonEndsAt: null }, { seasonEndsAt: { gte: now } }],
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        type: true,
        rarity: true,
        availability: true,
        price: true,
        storeVisible: true,
        isSeasonal: true,
        seasonNumber: true,
        featured: true,
        featuredOrder: true,
        createdAt: true,
      },
      orderBy: [
        { featured: "desc" },
        { featuredOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    const ownedInventory = user
      ? await prisma.userAvatar.findMany({
          where: {
            userId: user.id,
            unlocked: true,
          },
          select: { avatarId: true },
        })
      : [];

    const ownedIds = new Set(ownedInventory.map((entry) => entry.avatarId));

    const mappedItems: CosmeticStoreItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      type: item.type,
      rarity: item.rarity,
      availability: item.availability,
      price: item.price ?? 0,
      storeVisible: item.storeVisible ?? true,
      isSeasonal: item.isSeasonal ?? false,
      seasonNumber: item.seasonNumber ?? null,
      featured: item.featured ?? false,
      featuredOrder: item.featuredOrder ?? 0,
      createdAt: item.createdAt.toISOString(),
      owned: ownedIds.has(item.id),
    }));

    const featured = mappedItems.filter((item) => item.featured).slice(0, 2);
    if (featured.length < 2) {
      const fallback = mappedItems
        .filter((item) => !item.featured)
        .slice(0, 2 - featured.length);
      featured.push(...fallback);
    }

    return {
      isAuthenticated: Boolean(user),
      victoryPoints: user?.victoryPoints ?? 0,
      currentSeasonNumber,
      featured,
      items: mappedItems,
    };
  };
