"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  AdjustUserVictoryPointsSchema,
  AdminUsersFiltersSchema,
  BULK_ADJUST_USER_PV_MAX_USERS,
  BulkAdjustUserVictoryPointsSchema,
  UpdateAdminUserRoleStatusSchema,
  UserPvAdjustmentsSchema,
} from "@/schemas";
import type { Prisma } from "@prisma/client";

type ParsedAdminUsersFilters = ReturnType<typeof AdminUsersFiltersSchema.parse>;

export type AdminUserListItem = {
  id: string;
  name: string | null;
  lastname: string | null;
  email: string | null;
  nickname: string;
  role: string;
  status: string;
  victoryPoints: number;
  eloPoints: number;
  tournamentsPlayed: number;
  matchesPlayed: number;
  createdAt: string;
  updatedAt: string;
  isCurrentAdmin: boolean;
};

export type AdminUsersResult = {
  items: AdminUserListItem[];
  totalCount: number;
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
};

export type UserPvAdjustmentLog = {
  id: string;
  amount: number;
  previousBalance: number;
  nextBalance: number;
  reason: string;
  createdAt: string;
  admin: {
    id: string;
    nickname: string | null;
    name: string | null;
    lastname: string | null;
    email: string | null;
  };
};

const requireAdminSession = async () => {
  const session = await auth();

  if (!session?.user?.idd || session.user.role !== "admin") {
    throw new Error("No tienes permisos para administrar usuarios.");
  }

  return {
    adminId: session.user.idd,
  };
};

const buildSearchFilter = (query: string): Prisma.UserWhereInput => ({
  OR: [
    { nickname: { contains: query, mode: "insensitive" } },
    { email: { contains: query, mode: "insensitive" } },
    { name: { contains: query, mode: "insensitive" } },
    { lastname: { contains: query, mode: "insensitive" } },
  ],
});

const resolveOrderBy = (
  order: ParsedAdminUsersFilters["order"],
): Prisma.UserOrderByWithRelationInput[] => {
  switch (order) {
    case "oldest":
      return [{ createdAt: "asc" }];
    case "name-asc":
      return [{ nickname: "asc" }, { name: "asc" }];
    case "name-desc":
      return [{ nickname: "desc" }, { name: "desc" }];
    case "pv-desc":
      return [{ victoryPoints: "desc" }, { nickname: "asc" }];
    case "pv-asc":
      return [{ victoryPoints: "asc" }, { nickname: "asc" }];
    case "elo-desc":
      return [{ eloPoints: "desc" }, { nickname: "asc" }];
    case "elo-asc":
      return [{ eloPoints: "asc" }, { nickname: "asc" }];
    case "recent":
    default:
      return [{ createdAt: "desc" }];
  }
};

export const getAdminUsersAction = async (
  input?: Partial<ParsedAdminUsersFilters>,
): Promise<AdminUsersResult> => {
  const { adminId } = await requireAdminSession();
  const parsed = AdminUsersFiltersSchema.parse(input ?? {});
  const filters: Prisma.UserWhereInput[] = [];
  const query = parsed.query.trim();

  if (query) {
    filters.push(buildSearchFilter(query));
  }

  if (parsed.role !== "all") {
    filters.push({ role: parsed.role });
  }

  if (parsed.status !== "all") {
    filters.push({ status: parsed.status });
  }

  const where: Prisma.UserWhereInput =
    filters.length > 0 ? { AND: filters } : {};

  const [totalCount, totalUsers] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / parsed.perPage));
  const currentPage = Math.min(parsed.page, totalPages);

  const users = await prisma.user.findMany({
    where,
    orderBy: resolveOrderBy(parsed.order),
    skip: (currentPage - 1) * parsed.perPage,
    take: parsed.perPage,
    select: {
      id: true,
      name: true,
      lastname: true,
      email: true,
      nickname: true,
      role: true,
      status: true,
      victoryPoints: true,
      eloPoints: true,
      tournamentsPlayed: true,
      matchesPlayed: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    items: users.map((user) => ({
      ...user,
      role: user.role,
      status: user.status,
      victoryPoints: user.victoryPoints ?? 0,
      eloPoints: user.eloPoints ?? 0,
      tournamentsPlayed: user.tournamentsPlayed ?? 0,
      matchesPlayed: user.matchesPlayed ?? 0,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      isCurrentAdmin: user.id === adminId,
    })),
    totalCount,
    totalUsers,
    totalPages,
    currentPage,
    perPage: parsed.perPage,
  };
};

export const updateAdminUserRoleStatusAction = async (input: unknown) => {
  const { adminId } = await requireAdminSession();
  const parsed = UpdateAdminUserRoleStatusSchema.parse(input);

  if (
    parsed.userId === adminId &&
    (parsed.role !== "admin" || parsed.status !== "active")
  ) {
    throw new Error("No puedes quitarte el rol admin ni desactivar tu cuenta.");
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("El usuario seleccionado no existe.");
  }

  const updated = await prisma.user.update({
    where: { id: parsed.userId },
    data: {
      role: parsed.role,
      status: parsed.status,
    },
    select: {
      id: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  return {
    ok: true,
    user: {
      id: updated.id,
      role: updated.role,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    },
  };
};

export const adjustUserVictoryPointsAction = async (input: unknown) => {
  const { adminId } = await requireAdminSession();
  const parsed = AdjustUserVictoryPointsSchema.parse(input);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: parsed.userId },
      select: { id: true, victoryPoints: true },
    });

    if (!user) {
      throw new Error("El usuario seleccionado no existe.");
    }

    const previousBalance = user.victoryPoints ?? 0;
    const nextBalance = previousBalance + parsed.amount;

    if (nextBalance < 0) {
      throw new Error("El usuario no puede quedar con PV negativos.");
    }

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        victoryPoints: nextBalance,
      },
      select: {
        id: true,
        victoryPoints: true,
        updatedAt: true,
      },
    });

    const adjustment = await tx.victoryPointAdjustment.create({
      data: {
        userId: user.id,
        adminId,
        amount: parsed.amount,
        previousBalance,
        nextBalance,
        reason: parsed.reason,
      },
      select: {
        id: true,
        amount: true,
        previousBalance: true,
        nextBalance: true,
        reason: true,
        createdAt: true,
      },
    });

    return { updatedUser, adjustment };
  });

  return {
    ok: true,
    victoryPoints: result.updatedUser.victoryPoints ?? 0,
    updatedAt: result.updatedUser.updatedAt.toISOString(),
    adjustment: {
      ...result.adjustment,
      createdAt: result.adjustment.createdAt.toISOString(),
    },
  };
};

export const bulkAdjustUserVictoryPointsAction = async (input: unknown) => {
  const { adminId } = await requireAdminSession();
  const parsed = BulkAdjustUserVictoryPointsSchema.parse(input);

  const result = await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({
      where: { id: { in: parsed.selection.userIds } },
      select: {
        id: true,
        victoryPoints: true,
      },
    });

    if (users.length === 0) {
      throw new Error("No hay usuarios para ajustar.");
    }

    if (users.length > BULK_ADJUST_USER_PV_MAX_USERS) {
      throw new Error(
        `No puedes ajustar mas de ${BULK_ADJUST_USER_PV_MAX_USERS} usuarios a la vez.`,
      );
    }

    const userIds = users.map((user) => user.id);
    const adjustmentRows = users.map((user) => {
      const previousBalance = user.victoryPoints ?? 0;

      return {
        userId: user.id,
        adminId,
        amount: parsed.amount,
        previousBalance,
        nextBalance: previousBalance + parsed.amount,
        reason: parsed.reason,
      };
    });

    // Evita 2 consultas por usuario dentro de la transaccion; con 100 usuarios
    // el flujo anterior expiraba el timeout interactivo de Prisma.
    const updateResult = await tx.user.updateMany({
      where: { id: { in: userIds } },
      data: {
        victoryPoints: { increment: parsed.amount },
      },
    });

    await tx.victoryPointAdjustment.createMany({
      data: adjustmentRows,
    });

    return {
      affectedCount: updateResult.count,
    };
  });

  return {
    ok: true,
    affectedCount: result.affectedCount,
    amount: parsed.amount,
    selectionMode: "selected" as const,
  };
};

export const getUserPvAdjustmentsAction = async (
  input: unknown,
): Promise<UserPvAdjustmentLog[]> => {
  await requireAdminSession();
  const parsed = UserPvAdjustmentsSchema.parse(input);

  const adjustments = await prisma.victoryPointAdjustment.findMany({
    where: { userId: parsed.userId },
    orderBy: { createdAt: "desc" },
    take: parsed.limit,
    select: {
      id: true,
      amount: true,
      previousBalance: true,
      nextBalance: true,
      reason: true,
      createdAt: true,
      admin: {
        select: {
          id: true,
          nickname: true,
          name: true,
          lastname: true,
          email: true,
        },
      },
    },
  });

  return adjustments.map((adjustment) => ({
    ...adjustment,
    createdAt: adjustment.createdAt.toISOString(),
  }));
};
