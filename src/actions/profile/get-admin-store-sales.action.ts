"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const AdminStoreSalesFiltersSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  perPage: z.number().int().min(1).max(50).optional().default(10),
  query: z.string().trim().max(100).optional().default(""),
  type: z.enum(["ALL", "AVATAR", "BANNER", "FRAME"]).optional().default("ALL"),
  rarity: z
    .enum(["ALL", "COMMON", "RARE", "ULTRA", "SECRET", "ASCENDED"])
    .optional()
    .default("ALL"),
  season: z.string().trim().max(20).optional().default("ALL"),
  order: z
    .enum(["recent", "oldest", "price-desc", "price-asc"])
    .optional()
    .default("recent"),
});

export type AdminStoreSalesFilters = z.input<
  typeof AdminStoreSalesFiltersSchema
>;

export type AdminStoreSaleLog = {
  id: string;
  pricePaid: number;
  seasonNumber: number | null;
  createdAt: string;
  user: {
    id: string;
    nickname: string | null;
    email: string | null;
    name: string | null;
    lastname: string | null;
    victoryPoints: number;
  };
  cosmetic: {
    id: string;
    name: string;
    imageUrl: string;
    type: string;
    rarity: string;
  };
};

export type AdminStoreSalesResult = {
  items: AdminStoreSaleLog[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  seasonOptions: number[];
};

const buildSearchFilter = (query: string): Prisma.AvatarPurchaseWhereInput => ({
  OR: [
    { user: { is: { nickname: { contains: query, mode: "insensitive" } } } },
    { user: { is: { email: { contains: query, mode: "insensitive" } } } },
    { user: { is: { name: { contains: query, mode: "insensitive" } } } },
    { user: { is: { lastname: { contains: query, mode: "insensitive" } } } },
    { avatar: { is: { name: { contains: query, mode: "insensitive" } } } },
  ],
});

const resolveOrderBy = (
  order: z.infer<typeof AdminStoreSalesFiltersSchema>["order"],
): Prisma.AvatarPurchaseOrderByWithRelationInput => {
  switch (order) {
    case "oldest":
      return { createdAt: "asc" };
    case "price-desc":
      return { pricePaid: "desc" };
    case "price-asc":
      return { pricePaid: "asc" };
    case "recent":
    default:
      return { createdAt: "desc" };
  }
};

export const getAdminStoreSalesAction = async (
  input?: AdminStoreSalesFilters,
): Promise<AdminStoreSalesResult> => {
  const parsed = AdminStoreSalesFiltersSchema.parse(input ?? {});
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("No tienes permisos para consultar ventas de la tienda.");
  }

  const filters: Prisma.AvatarPurchaseWhereInput[] = [];
  const query = parsed.query.trim();

  if (query) {
    filters.push(buildSearchFilter(query));
  }

  if (parsed.type !== "ALL") {
    filters.push({ avatar: { is: { type: parsed.type } } });
  }

  if (parsed.rarity !== "ALL") {
    filters.push({ avatar: { is: { rarity: parsed.rarity } } });
  }

  if (parsed.season === "PERMANENT") {
    filters.push({ seasonNumber: null });
  } else if (/^\d+$/.test(parsed.season)) {
    filters.push({ seasonNumber: Number(parsed.season) });
  }

  const where: Prisma.AvatarPurchaseWhereInput =
    filters.length > 0 ? { AND: filters } : {};

  const [totalCount, seasonRows] = await Promise.all([
    prisma.avatarPurchase.count({ where }),
    prisma.avatarPurchase.findMany({
      where: { seasonNumber: { not: null } },
      select: { seasonNumber: true },
      orderBy: { seasonNumber: "desc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / parsed.perPage));
  const currentPage = Math.min(parsed.page, totalPages);

  const purchases = await prisma.avatarPurchase.findMany({
    where,
    orderBy: resolveOrderBy(parsed.order),
    skip: (currentPage - 1) * parsed.perPage,
    take: parsed.perPage,
    select: {
      id: true,
      pricePaid: true,
      seasonNumber: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          email: true,
          name: true,
          lastname: true,
          victoryPoints: true,
        },
      },
      avatar: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          type: true,
          rarity: true,
        },
      },
    },
  });

  const seasonOptions = Array.from(
    new Set(
      seasonRows
        .map((row) => row.seasonNumber)
        .filter((season): season is number => typeof season === "number"),
    ),
  ).sort((a, b) => b - a);

  return {
    items: purchases.map((purchase) => ({
      id: purchase.id,
      pricePaid: purchase.pricePaid,
      seasonNumber: purchase.seasonNumber ?? null,
      createdAt: purchase.createdAt.toISOString(),
      user: {
        id: purchase.user.id,
        nickname: purchase.user.nickname ?? null,
        email: purchase.user.email ?? null,
        name: purchase.user.name ?? null,
        lastname: purchase.user.lastname ?? null,
        victoryPoints: purchase.user.victoryPoints ?? 0,
      },
      cosmetic: {
        id: purchase.avatar.id,
        name: purchase.avatar.name,
        imageUrl: purchase.avatar.imageUrl,
        type: purchase.avatar.type,
        rarity: purchase.avatar.rarity,
      },
    })),
    totalCount,
    totalPages,
    currentPage,
    perPage: parsed.perPage,
    seasonOptions,
  };
};
