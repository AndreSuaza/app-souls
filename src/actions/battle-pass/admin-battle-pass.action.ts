"use server";

import { auth } from "@/auth";
import { deleteAsset, uploadAsset } from "@/lib/assets-storage";
import { prisma } from "@/lib/prisma";
import { MEDIA_SECTION_CONFIG } from "@/models/media.models";
import {
  AdminBattlePassPlayersQuerySchema,
  AdminBattlePassProgressAdjustmentSchema,
  BattlePassClaimIdSchema,
  BattlePassIdSchema,
  BattlePassLevelIdSchema,
  CreateBattlePassSchema,
  ReorderBattlePassLevelsSchema,
  UpdateBattlePassSchema,
  UpsertBattlePassLevelSchema,
  type CreateBattlePassInput,
  type UpdateBattlePassInput,
  type UpsertBattlePassLevelInput,
} from "@/schemas/battle-pass/battle-pass.schema";
import { calculateBattlePassProgress } from "@/logic/battle-pass-progress";
import type { AvatarType, BattlePassClaimStatus, Prisma } from "@prisma/client";
import sharp from "sharp";
import { z } from "zod";

const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user?.idd || session.user.role !== "admin") {
    throw new Error("No tienes permisos para administrar el pase de batalla.");
  }

  return session.user.idd;
};

const AdminBattlePassClaimsFiltersSchema = z.object({
  status: z
    .enum(["ALL", "CLAIMED", "PENDING_FULFILLMENT", "FULFILLED"])
    .optional()
    .default("PENDING_FULFILLMENT"),
});

const FulfillBattlePassClaimsSchema = z.object({
  userId: z.string().min(1, "El usuario es requerido."),
  claimIds: z.array(z.string().min(1)).min(1, "Selecciona recompensas."),
});

const buildSafeName = (name: string) => {
  const base = name.replace(/\.[^/.]+$/, "");
  const normalized = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return normalized || "recompensa";
};

const normalizeDateRange = (startsAt: Date, endsAt: Date) => {
  const normalizedStartsAt = new Date(startsAt);
  normalizedStartsAt.setUTCHours(0, 0, 0, 0);

  const normalizedEndsAt = new Date(endsAt);
  normalizedEndsAt.setUTCHours(23, 59, 59, 999);

  return {
    startsAt: normalizedStartsAt,
    endsAt: normalizedEndsAt,
  };
};

const battlePassSelect = {
  id: true,
  title: true,
  description: true,
  seasonNumber: true,
  startsAt: true,
  endsAt: true,
  status: true,
  backgroundImageUrl: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      levels: true,
      claims: true,
    },
  },
} satisfies Prisma.BattlePassSelect;

const levelSelect = {
  id: true,
  battlePassId: true,
  levelNumber: true,
  title: true,
  description: true,
  imageUrl: true,
  rewardType: true,
  rewardAvatarId: true,
  victoryPointsReward: true,
  manualRewardLabel: true,
  createdAt: true,
  updatedAt: true,
  rewardAvatar: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
      type: true,
      rarity: true,
    },
  },
  _count: {
    select: {
      claims: true,
    },
  },
} satisfies Prisma.BattlePassLevelSelect;

const mapBattlePass = (
  pass: Prisma.BattlePassGetPayload<{
    select: typeof battlePassSelect;
  }>,
) => ({
  id: pass.id,
  title: pass.title,
  description: pass.description,
  seasonNumber: pass.seasonNumber,
  startsAt: pass.startsAt.toISOString(),
  endsAt: pass.endsAt.toISOString(),
  status: pass.status,
  backgroundImageUrl: pass.backgroundImageUrl,
  createdAt: pass.createdAt.toISOString(),
  updatedAt: pass.updatedAt.toISOString(),
  levelsCount: pass._count.levels,
  claimsCount: pass._count.claims,
});

const mapLevel = (
  level: Prisma.BattlePassLevelGetPayload<{
    select: typeof levelSelect;
  }>,
) => ({
  id: level.id,
  battlePassId: level.battlePassId,
  levelNumber: level.levelNumber,
  title: level.title,
  description: level.description,
  imageUrl: level.imageUrl,
  rewardType: level.rewardType,
  rewardAvatarId: level.rewardAvatarId,
  victoryPointsReward: level.victoryPointsReward,
  manualRewardLabel: level.manualRewardLabel,
  createdAt: level.createdAt.toISOString(),
  updatedAt: level.updatedAt.toISOString(),
  claimsCount: level._count.claims,
  rewardAvatar: level.rewardAvatar
    ? {
        id: level.rewardAvatar.id,
        name: level.rewardAvatar.name,
        imageUrl: level.rewardAvatar.imageUrl,
        type: level.rewardAvatar.type,
        rarity: level.rewardAvatar.rarity,
      }
    : null,
});

export type AdminBattlePassListItem = ReturnType<typeof mapBattlePass>;
export type AdminBattlePassLevel = ReturnType<typeof mapLevel>;
export type AdminBattlePassRewardMix = {
  AVATAR: number;
  BANNER: number;
  PV: number;
  MANUAL: number;
};

export type AdminBattlePassStats = {
  pendingStoreDeliveriesCount: number;
  rewardMix: AdminBattlePassRewardMix;
  totalPvReward: number;
  playersWithProgress: number;
  globalProgressPercent: number;
  claimRatioPercent: number;
  maxLevelNumber: number;
};

export type AdminBattlePassDetail = AdminBattlePassListItem & {
  levels: AdminBattlePassLevel[];
  stats: AdminBattlePassStats;
};

export type AdminBattlePassPlayerProgress = {
  user: {
    id: string;
    nickname: string;
    name: string | null;
    lastname: string | null;
    email: string | null;
  };
  automaticProgress: number;
  manualOffset: number;
  effectiveProgress: number;
  maxLevel: number;
  claimedLevels: number;
  claimedLockedLevels: number;
  lastAdjustmentAt: string | null;
};

export type AdminBattlePassPlayersResult = {
  items: AdminBattlePassPlayerProgress[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
};

export type BattlePassRewardOption = {
  id: string;
  name: string;
  imageUrl: string;
  type: "AVATAR" | "BANNER";
  rarity: string;
  availability: string | null;
};

export type AdminBattlePassClaim = {
  id: string;
  rewardType: string;
  status: string;
  claimedAt: string;
  fulfilledAt: string | null;
  victoryPointsAwarded: number | null;
  user: {
    id: string;
    nickname: string | null;
    email: string | null;
    name: string | null;
    lastname: string | null;
  };
  battlePass: {
    id: string;
    title: string;
    seasonNumber: number;
  };
  level: {
    id: string;
    levelNumber: number;
    title: string;
    imageUrl: string | null;
    manualRewardLabel: string | null;
  };
  rewardAvatar: {
    id: string;
    name: string;
    imageUrl: string;
    type: string;
  } | null;
};

const normalizeLevelData = async (
  input: UpsertBattlePassLevelInput,
): Promise<Prisma.BattlePassLevelUncheckedCreateInput> => {
  let rewardAvatarId = input.rewardAvatarId ?? null;
  let imageUrl = input.imageUrl ?? null;
  let victoryPointsReward: number | null = null;
  let manualRewardLabel: string | null = null;

  if (input.rewardType === "AVATAR" || input.rewardType === "BANNER") {
    const expectedType: AvatarType = input.rewardType;
    const avatar = await prisma.avatar.findFirst({
      where: {
        id: rewardAvatarId ?? "",
        type: expectedType,
      },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    if (!avatar) {
      throw new Error("El cosmetico seleccionado no existe o no coincide.");
    }

    rewardAvatarId = avatar.id;
    imageUrl = imageUrl || avatar.imageUrl;
  } else if (input.rewardType === "PV") {
    rewardAvatarId = null;
    victoryPointsReward = input.victoryPointsReward ?? 0;
  } else {
    rewardAvatarId = null;
    manualRewardLabel = input.manualRewardLabel ?? null;
  }

  return {
    battlePassId: input.battlePassId,
    levelNumber: input.levelNumber,
    title: input.title,
    description: input.description ?? null,
    imageUrl,
    rewardType: input.rewardType,
    rewardAvatarId,
    victoryPointsReward,
    manualRewardLabel,
  };
};

const persistBattlePassLevel = async (input: UpsertBattlePassLevelInput) => {
  const data = await normalizeLevelData(input);

  const pass = await prisma.battlePass.findUnique({
    where: { id: input.battlePassId },
    select: { id: true },
  });

  if (!pass) {
    throw new Error("El pase de batalla no existe.");
  }

  if (input.id) {
    const updated = await prisma.battlePassLevel.update({
      where: { id: input.id },
      data,
      select: levelSelect,
    });
    return mapLevel(updated);
  }

  const created = await prisma.battlePassLevel.create({
    data,
    select: levelSelect,
  });

  return mapLevel(created);
};

const parseLevelFormData = (formData: FormData) =>
  UpsertBattlePassLevelSchema.parse({
    id: String(formData.get("id") ?? "") || undefined,
    battlePassId: formData.get("battlePassId"),
    levelNumber: Number(formData.get("levelNumber")),
    title: formData.get("title"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    rewardType: formData.get("rewardType"),
    rewardAvatarId: String(formData.get("rewardAvatarId") ?? "") || null,
    victoryPointsReward: Number(formData.get("victoryPointsReward") ?? 0),
    manualRewardLabel: formData.get("manualRewardLabel"),
  });

const uploadBattlePassRewardImage = async (file: File, title: string) => {
  const config = MEDIA_SECTION_CONFIG["battle-pass-rewards"];

  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten imagenes.");
  }

  const maxBytes = config.maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`La imagen supera el limite de ${config.maxSizeMb}MB.`);
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const outputBuffer = await sharp(inputBuffer).webp({ quality: 90 }).toBuffer();
  const safeName = buildSafeName(title || file.name);
  const path = `${config.folder}/${safeName}-${crypto.randomUUID()}.webp`;

  return uploadAsset({
    path,
    buffer: outputBuffer,
    contentType: "image/webp",
  });
};

const uploadBattlePassBackgroundImage = async (file: File, title: string) => {
  const config = MEDIA_SECTION_CONFIG["battle-pass-backgrounds"];

  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten imagenes.");
  }

  const maxBytes = config.maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`La imagen supera el limite de ${config.maxSizeMb}MB.`);
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const outputBuffer = await sharp(inputBuffer).webp({ quality: 88 }).toBuffer();
  const safeName = buildSafeName(title || file.name);
  const path = `${config.folder}/${safeName}-${crypto.randomUUID()}.webp`;

  return uploadAsset({
    path,
    buffer: outputBuffer,
    contentType: "image/webp",
  });
};

const parseBattlePassFormData = (formData: FormData) => {
  const id = String(formData.get("id") ?? "");

  return (id ? UpdateBattlePassSchema : CreateBattlePassSchema).parse({
    ...(id ? { id } : {}),
    title: formData.get("title"),
    description: formData.get("description"),
    seasonNumber: Number(formData.get("seasonNumber")),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    status: formData.get("status"),
    backgroundImageUrl: formData.get("backgroundImageUrl"),
  });
};

const persistBattlePass = async (
  data: CreateBattlePassInput | UpdateBattlePassInput,
) => {
  const isUpdate = "id" in data;
  const { startsAt, endsAt } = normalizeDateRange(data.startsAt, data.endsAt);
  const result = await prisma.$transaction(async (tx) => {
    if (data.status === "ACTIVE") {
      await tx.battlePass.updateMany({
        where: {
          status: "ACTIVE",
          ...(isUpdate ? { id: { not: data.id } } : {}),
        },
        data: { status: "ARCHIVED" },
      });
    }

    if (isUpdate) {
      return tx.battlePass.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          seasonNumber: data.seasonNumber,
          startsAt,
          endsAt,
          status: data.status,
          backgroundImageUrl: data.backgroundImageUrl,
        },
        select: battlePassSelect,
      });
    }

    return tx.battlePass.create({
      data: {
        title: data.title,
        description: data.description,
        seasonNumber: data.seasonNumber,
        startsAt,
        endsAt,
        status: data.status,
        backgroundImageUrl: data.backgroundImageUrl,
      },
      select: battlePassSelect,
    });
  });

  return mapBattlePass(result);
};

export const getAdminBattlePassesAction = async (): Promise<
  AdminBattlePassListItem[]
> => {
  await requireAdmin();

  const passes = await prisma.battlePass.findMany({
    select: battlePassSelect,
    orderBy: [{ seasonNumber: "desc" }, { createdAt: "desc" }],
  });

  return passes.map(mapBattlePass);
};

export const getAdminBattlePassDetailAction = async (
  input: unknown,
): Promise<AdminBattlePassDetail> => {
  await requireAdmin();
  const parsed = BattlePassIdSchema.parse(input);

  const pass = await prisma.battlePass.findUnique({
    where: { id: parsed.battlePassId },
    select: {
      ...battlePassSelect,
      levels: {
        select: levelSelect,
        orderBy: { levelNumber: "asc" },
      },
    },
  });

  if (!pass) {
    throw new Error("El pase de batalla no existe.");
  }

  const [pendingStoreDeliveriesCount, tournamentsInRange, progressOverrides] =
    await Promise.all([
    prisma.battlePassClaim.count({
      where: {
        battlePassId: pass.id,
        rewardType: "MANUAL",
        status: "PENDING_FULFILLMENT",
      },
    }),
    prisma.tournament.findMany({
      where: {
        status: "finished",
        date: {
          gte: pass.startsAt,
          lte: pass.endsAt,
        },
      },
      select: {
        id: true,
        tournamentPlayers: {
          select: {
            userId: true,
          },
        },
      },
    }),
      prisma.battlePassUserProgress.findMany({
        where: { battlePassId: pass.id },
        select: { userId: true, manualOffset: true },
      }),
    ]);

  const rewardMix = pass.levels.reduce<AdminBattlePassRewardMix>(
    (summary, level) => {
      summary[level.rewardType] += 1;
      return summary;
    },
    {
      AVATAR: 0,
      BANNER: 0,
      PV: 0,
      MANUAL: 0,
    },
  );
  const totalPvReward = pass.levels.reduce(
    (total, level) => total + (level.victoryPointsReward ?? 0),
    0,
  );
  const maxLevelNumber = pass.levels.reduce(
    (highest, level) => Math.max(highest, level.levelNumber),
    0,
  );
  const progressByUser = new Map<string, number>();

  tournamentsInRange.forEach((tournament) => {
    const uniqueUsersInTournament = new Set(
      tournament.tournamentPlayers.map((player) => player.userId),
    );

    uniqueUsersInTournament.forEach((userId) => {
      progressByUser.set(userId, (progressByUser.get(userId) ?? 0) + 1);
    });
  });

  const effectiveProgressByUser = new Map<string, number>();
  const manualOffsetByUser = new Map(
    progressOverrides.map((progress) => [progress.userId, progress.manualOffset]),
  );
  const progressUsers = new Set([
    ...progressByUser.keys(),
    ...progressOverrides.map((progress) => progress.userId),
  ]);

  progressUsers.forEach((userId) => {
    const manualOffset = manualOffsetByUser.get(userId) ?? 0;
    const effectiveProgress = calculateBattlePassProgress({
      automaticProgress: progressByUser.get(userId) ?? 0,
      manualOffset,
      maxLevel: maxLevelNumber,
    });

    if (effectiveProgress > 0) {
      effectiveProgressByUser.set(userId, effectiveProgress);
    }
  });

  const playersWithProgress = effectiveProgressByUser.size;
  const totalProgressPercent =
    playersWithProgress > 0 && maxLevelNumber > 0
      ? Array.from(effectiveProgressByUser.values()).reduce(
          (total, progress) =>
            total + (Math.min(progress, maxLevelNumber) / maxLevelNumber) * 100,
          0,
        )
      : 0;
  const globalProgressPercent =
    playersWithProgress > 0
      ? Math.round(totalProgressPercent / playersWithProgress)
      : 0;
  const possibleClaims = playersWithProgress * pass.levels.length;
  const claimRatioPercent =
    possibleClaims > 0
      ? Math.min(Math.round((pass._count.claims / possibleClaims) * 100), 100)
      : 0;

  return {
    ...mapBattlePass(pass),
    levels: pass.levels.map(mapLevel),
    stats: {
      pendingStoreDeliveriesCount,
      rewardMix,
      totalPvReward,
      playersWithProgress,
      globalProgressPercent,
      claimRatioPercent,
      maxLevelNumber,
    },
  };
};

const buildPlayerSearchFilter = (query: string): Prisma.UserWhereInput | null => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) return null;

  return {
    OR: [
      { nickname: { contains: normalizedQuery, mode: "insensitive" } },
      { email: { contains: normalizedQuery, mode: "insensitive" } },
      { name: { contains: normalizedQuery, mode: "insensitive" } },
      { lastname: { contains: normalizedQuery, mode: "insensitive" } },
    ],
  };
};

export const getAdminBattlePassPlayersAction = async (
  input: unknown,
): Promise<AdminBattlePassPlayersResult> => {
  await requireAdmin();
  const parsed = AdminBattlePassPlayersQuerySchema.parse(input);
  const pass = await prisma.battlePass.findUnique({
    where: { id: parsed.battlePassId },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      levels: { select: { levelNumber: true } },
    },
  });

  if (!pass) {
    throw new Error("El pase de batalla no existe.");
  }

  const searchFilter = buildPlayerSearchFilter(parsed.query);
  const where: Prisma.UserWhereInput = searchFilter ?? {};
  const totalCount = await prisma.user.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / parsed.perPage));
  const currentPage = Math.min(parsed.page, totalPages);
  const users = await prisma.user.findMany({
    where,
    orderBy: [{ nickname: "asc" }],
    skip: (currentPage - 1) * parsed.perPage,
    take: parsed.perPage,
    select: {
      id: true,
      nickname: true,
      name: true,
      lastname: true,
      email: true,
    },
  });
  const userIds = users.map((user) => user.id);
  const maxLevel = pass.levels.reduce(
    (highest, level) => Math.max(highest, level.levelNumber),
    0,
  );

  if (userIds.length === 0) {
    return {
      items: [],
      totalCount,
      totalPages,
      currentPage,
      perPage: parsed.perPage,
    };
  }

  const [tournaments, progressOverrides, claims, adjustments] =
    await Promise.all([
      prisma.tournament.findMany({
        where: {
          status: "finished",
          date: { gte: pass.startsAt, lte: pass.endsAt },
          tournamentPlayers: { some: { userId: { in: userIds } } },
        },
        select: {
          tournamentPlayers: {
            where: { userId: { in: userIds } },
            select: { userId: true },
          },
        },
      }),
      prisma.battlePassUserProgress.findMany({
        where: { battlePassId: pass.id, userId: { in: userIds } },
        select: { userId: true, manualOffset: true },
      }),
      prisma.battlePassClaim.findMany({
        where: { battlePassId: pass.id, userId: { in: userIds } },
        select: {
          userId: true,
          battlePassLevel: { select: { levelNumber: true } },
        },
      }),
      prisma.battlePassProgressAdjustment.findMany({
        where: { battlePassId: pass.id, userId: { in: userIds } },
        orderBy: { createdAt: "desc" },
        select: { userId: true, createdAt: true },
      }),
    ]);

  const automaticProgressByUser = new Map<string, number>();
  tournaments.forEach((tournament) => {
    new Set(tournament.tournamentPlayers.map((player) => player.userId)).forEach(
      (userId) => {
        automaticProgressByUser.set(
          userId,
          (automaticProgressByUser.get(userId) ?? 0) + 1,
        );
      },
    );
  });
  const manualOffsetByUser = new Map(
    progressOverrides.map((progress) => [progress.userId, progress.manualOffset]),
  );
  const claimedLevelsByUser = new Map<string, number>();
  const claimedLevelNumbersByUser = new Map<string, number[]>();
  claims.forEach((claim) => {
    claimedLevelsByUser.set(
      claim.userId,
      (claimedLevelsByUser.get(claim.userId) ?? 0) + 1,
    );
    claimedLevelNumbersByUser.set(
      claim.userId,
      [
        ...(claimedLevelNumbersByUser.get(claim.userId) ?? []),
        claim.battlePassLevel.levelNumber,
      ],
    );
  });
  const lastAdjustmentByUser = new Map<string, Date>();
  adjustments.forEach((adjustment) => {
    if (!lastAdjustmentByUser.has(adjustment.userId)) {
      lastAdjustmentByUser.set(adjustment.userId, adjustment.createdAt);
    }
  });

  return {
    items: users.map((user) => {
      const automaticProgress = automaticProgressByUser.get(user.id) ?? 0;
      const manualOffset = manualOffsetByUser.get(user.id) ?? 0;
      const effectiveProgress = calculateBattlePassProgress({
        automaticProgress,
        manualOffset,
        maxLevel,
      });

      return {
        user,
        automaticProgress,
        manualOffset,
        effectiveProgress,
        maxLevel,
        claimedLevels: claimedLevelsByUser.get(user.id) ?? 0,
        claimedLockedLevels: (
          claimedLevelNumbersByUser.get(user.id) ?? []
        ).filter((levelNumber) => levelNumber > effectiveProgress).length,
        lastAdjustmentAt:
          lastAdjustmentByUser.get(user.id)?.toISOString() ?? null,
      };
    }),
    totalCount,
    totalPages,
    currentPage,
    perPage: parsed.perPage,
  };
};

export const adjustAdminBattlePassPlayerProgressAction = async (
  input: unknown,
) => {
  const adminId = await requireAdmin();
  const parsed = AdminBattlePassProgressAdjustmentSchema.parse(input);

  const result = await prisma.$transaction(async (tx) => {
    const [pass, user, currentProgress] = await Promise.all([
      tx.battlePass.findUnique({
        where: { id: parsed.battlePassId },
        select: { id: true },
      }),
      tx.user.findFirst({
        where: { id: parsed.userId },
        select: { id: true },
      }),
      tx.battlePassUserProgress.findUnique({
        where: {
          userId_battlePassId: {
            userId: parsed.userId,
            battlePassId: parsed.battlePassId,
          },
        },
        select: { manualOffset: true },
      }),
    ]);

    if (!pass) throw new Error("El pase de batalla no existe.");
    if (!user) throw new Error("El jugador seleccionado no existe.");

    const previousOffset = currentProgress?.manualOffset ?? 0;
    const nextOffset = previousOffset + parsed.amount;
    const progress = await tx.battlePassUserProgress.upsert({
      where: {
        userId_battlePassId: {
          userId: parsed.userId,
          battlePassId: parsed.battlePassId,
        },
      },
      create: {
        userId: parsed.userId,
        battlePassId: parsed.battlePassId,
        manualOffset: nextOffset,
      },
      update: { manualOffset: nextOffset },
      select: { manualOffset: true },
    });

    const adjustment = await tx.battlePassProgressAdjustment.create({
      data: {
        userId: parsed.userId,
        battlePassId: parsed.battlePassId,
        adminId,
        amount: parsed.amount,
        previousOffset,
        nextOffset,
        reason: parsed.reason,
      },
      select: { id: true, amount: true, nextOffset: true, createdAt: true },
    });

    return { progress, adjustment };
  });

  return {
    ok: true,
    manualOffset: result.progress.manualOffset,
    adjustment: {
      id: result.adjustment.id,
      amount: result.adjustment.amount,
      nextOffset: result.adjustment.nextOffset,
      createdAt: result.adjustment.createdAt.toISOString(),
    },
  };
};

export const createBattlePassAction = async (input: unknown) => {
  await requireAdmin();
  const parsed = CreateBattlePassSchema.parse(input);
  return persistBattlePass(parsed);
};

export const updateBattlePassAction = async (input: unknown) => {
  await requireAdmin();
  const parsed = UpdateBattlePassSchema.parse(input);
  return persistBattlePass(parsed);
};

export const upsertBattlePassWithBackgroundAction = async (
  formData: FormData,
) => {
  await requireAdmin();

  const file = formData.get("backgroundImageFile");
  const hasImageFile = file instanceof File && file.size > 0;
  let uploadedPathname: string | null = null;
  const parsed = parseBattlePassFormData(formData);

  try {
    const backgroundImageUrl = hasImageFile
      ? (await uploadBattlePassBackgroundImage(file, parsed.title)).pathname
      : parsed.backgroundImageUrl;

    if (backgroundImageUrl && hasImageFile) {
      uploadedPathname = backgroundImageUrl;
    }

    return persistBattlePass({
      ...parsed,
      backgroundImageUrl,
    });
  } catch (error) {
    if (uploadedPathname) {
      await deleteAsset(uploadedPathname).catch((deleteError) => {
        console.error(
          "[upsertBattlePassWithBackgroundAction:cleanup]",
          deleteError,
        );
      });
    }

    throw error;
  }
};

export const deleteBattlePassAction = async (input: unknown) => {
  await requireAdmin();
  const parsed = BattlePassIdSchema.parse(input);

  const claimsCount = await prisma.battlePassClaim.count({
    where: { battlePassId: parsed.battlePassId },
  });

  if (claimsCount > 0) {
    throw new Error("No puedes eliminar un pase con recompensas reclamadas.");
  }

  await prisma.$transaction([
    prisma.battlePassLevel.deleteMany({
      where: { battlePassId: parsed.battlePassId },
    }),
    prisma.battlePass.delete({ where: { id: parsed.battlePassId } }),
  ]);

  return { ok: true };
};

export const upsertBattlePassLevelAction = async (input: unknown) => {
  await requireAdmin();
  const parsed = UpsertBattlePassLevelSchema.parse(input);
  return persistBattlePassLevel(parsed);
};

export const upsertBattlePassLevelWithImageAction = async (
  formData: FormData,
) => {
  await requireAdmin();

  const file = formData.get("imageFile");
  const hasImageFile = file instanceof File && file.size > 0;
  let uploadedPathname: string | null = null;

  const parsed = parseLevelFormData(formData);

  try {
    const imageUrl =
      parsed.rewardType === "MANUAL" && hasImageFile
        ? (await uploadBattlePassRewardImage(file, parsed.title)).pathname
        : parsed.imageUrl;

    if (imageUrl && parsed.rewardType === "MANUAL" && hasImageFile) {
      uploadedPathname = imageUrl;
    }

    return persistBattlePassLevel({
      ...parsed,
      imageUrl,
    });
  } catch (error) {
    if (uploadedPathname) {
      await deleteAsset(uploadedPathname).catch((deleteError) => {
        console.error("[upsertBattlePassLevelWithImageAction:cleanup]", deleteError);
      });
    }

    throw error;
  }
};

export const deleteBattlePassLevelAction = async (input: unknown) => {
  await requireAdmin();
  const parsed = BattlePassLevelIdSchema.parse(input);

  const claimsCount = await prisma.battlePassClaim.count({
    where: { battlePassLevelId: parsed.levelId },
  });

  if (claimsCount > 0) {
    throw new Error("No puedes eliminar un nivel con reclamos registrados.");
  }

  await prisma.battlePassLevel.delete({
    where: { id: parsed.levelId },
  });

  return { ok: true };
};

export const reorderBattlePassLevelsAction = async (input: unknown) => {
  await requireAdmin();
  const parsed = ReorderBattlePassLevelsSchema.parse(input);
  const uniqueLevelIds = new Set(parsed.levelIds);

  if (uniqueLevelIds.size !== parsed.levelIds.length) {
    throw new Error("El orden enviado contiene niveles repetidos.");
  }

  const pass = await prisma.battlePass.findUnique({
    where: { id: parsed.battlePassId },
    select: {
      id: true,
      status: true,
      levels: {
        select: { id: true },
      },
      _count: {
        select: {
          claims: true,
        },
      },
    },
  });

  if (!pass) {
    throw new Error("El pase de batalla no existe.");
  }

  if (pass.status !== "DRAFT") {
    throw new Error("Solo puedes reordenar niveles de pases en borrador.");
  }

  if (pass._count.claims > 0) {
    throw new Error("No puedes reordenar un pase con reclamos registrados.");
  }

  if (pass.levels.length !== parsed.levelIds.length) {
    throw new Error("El orden debe incluir todos los niveles del pase.");
  }

  const passLevelIds = new Set(pass.levels.map((level) => level.id));
  const everyLevelBelongsToPass = parsed.levelIds.every((levelId) =>
    passLevelIds.has(levelId),
  );

  if (!everyLevelBelongsToPass) {
    throw new Error("El orden contiene niveles que no pertenecen al pase.");
  }

  await prisma.$transaction([
    ...parsed.levelIds.map((levelId, index) =>
      prisma.battlePassLevel.update({
        where: { id: levelId },
        data: { levelNumber: -(index + 1) },
      }),
    ),
    ...parsed.levelIds.map((levelId, index) =>
      prisma.battlePassLevel.update({
        where: { id: levelId },
        data: { levelNumber: index + 1 },
      }),
    ),
  ]);

  return { ok: true };
};

export const getBattlePassRewardOptionsAction = async (): Promise<
  BattlePassRewardOption[]
> => {
  await requireAdmin();

  const items = await prisma.avatar.findMany({
    where: {
      type: { in: ["AVATAR", "BANNER"] },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      type: true,
      rarity: true,
      availability: true,
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    imageUrl: item.imageUrl,
    type: item.type as "AVATAR" | "BANNER",
    rarity: item.rarity,
    availability: item.availability,
  }));
};

export const getAdminBattlePassClaimsAction = async (input?: {
  status?: BattlePassClaimStatus | "ALL";
}): Promise<AdminBattlePassClaim[]> => {
  await requireAdmin();
  const { status } = AdminBattlePassClaimsFiltersSchema.parse(input ?? {});

  const claims = await prisma.battlePassClaim.findMany({
    where: status === "ALL" ? {} : { status },
    orderBy: { claimedAt: "desc" },
    take: 100,
    select: {
      id: true,
      rewardType: true,
      status: true,
      claimedAt: true,
      fulfilledAt: true,
      victoryPointsAwarded: true,
      user: {
        select: {
          id: true,
          nickname: true,
          email: true,
          name: true,
          lastname: true,
        },
      },
      battlePass: {
        select: {
          id: true,
          title: true,
          seasonNumber: true,
        },
      },
      battlePassLevel: {
        select: {
          id: true,
          levelNumber: true,
          title: true,
          imageUrl: true,
          manualRewardLabel: true,
        },
      },
      rewardAvatar: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          type: true,
        },
      },
    },
  });

  return claims.map((claim) => ({
    id: claim.id,
    rewardType: claim.rewardType,
    status: claim.status,
    claimedAt: claim.claimedAt.toISOString(),
    fulfilledAt: claim.fulfilledAt?.toISOString() ?? null,
    victoryPointsAwarded: claim.victoryPointsAwarded,
    user: claim.user,
    battlePass: claim.battlePass,
    level: {
      id: claim.battlePassLevel.id,
      levelNumber: claim.battlePassLevel.levelNumber,
      title: claim.battlePassLevel.title,
      imageUrl: claim.battlePassLevel.imageUrl,
      manualRewardLabel: claim.battlePassLevel.manualRewardLabel,
    },
    rewardAvatar: claim.rewardAvatar,
  }));
};

export const getStoreBattlePassDeliveriesAction = async (): Promise<
  AdminBattlePassClaim[]
> => {
  await requireAdmin();

  const claims = await prisma.battlePassClaim.findMany({
    where: {
      rewardType: "MANUAL",
      status: "PENDING_FULFILLMENT",
      battlePass: {
        status: { in: ["ACTIVE", "ARCHIVED"] },
      },
    },
    orderBy: { claimedAt: "desc" },
    take: 100,
    select: {
      id: true,
      rewardType: true,
      status: true,
      claimedAt: true,
      fulfilledAt: true,
      victoryPointsAwarded: true,
      user: {
        select: {
          id: true,
          nickname: true,
          email: true,
          name: true,
          lastname: true,
        },
      },
      battlePass: {
        select: {
          id: true,
          title: true,
          seasonNumber: true,
        },
      },
      battlePassLevel: {
        select: {
          id: true,
          levelNumber: true,
          title: true,
          imageUrl: true,
          manualRewardLabel: true,
        },
      },
      rewardAvatar: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          type: true,
        },
      },
    },
  });

  return claims.map((claim) => ({
    id: claim.id,
    rewardType: claim.rewardType,
    status: claim.status,
    claimedAt: claim.claimedAt.toISOString(),
    fulfilledAt: claim.fulfilledAt?.toISOString() ?? null,
    victoryPointsAwarded: claim.victoryPointsAwarded,
    user: claim.user,
    battlePass: claim.battlePass,
    level: {
      id: claim.battlePassLevel.id,
      levelNumber: claim.battlePassLevel.levelNumber,
      title: claim.battlePassLevel.title,
      imageUrl: claim.battlePassLevel.imageUrl,
      manualRewardLabel: claim.battlePassLevel.manualRewardLabel,
    },
    rewardAvatar: claim.rewardAvatar,
  }));
};

export const getStoreBattlePassDeliveryHistoryAction = async (): Promise<
  AdminBattlePassClaim[]
> => {
  await requireAdmin();

  const claims = await prisma.battlePassClaim.findMany({
    where: {
      rewardType: "MANUAL",
      status: "FULFILLED",
    },
    orderBy: { fulfilledAt: "desc" },
    take: 150,
    select: {
      id: true,
      rewardType: true,
      status: true,
      claimedAt: true,
      fulfilledAt: true,
      victoryPointsAwarded: true,
      user: {
        select: {
          id: true,
          nickname: true,
          email: true,
          name: true,
          lastname: true,
        },
      },
      battlePass: {
        select: {
          id: true,
          title: true,
          seasonNumber: true,
        },
      },
      battlePassLevel: {
        select: {
          id: true,
          levelNumber: true,
          title: true,
          imageUrl: true,
          manualRewardLabel: true,
        },
      },
      rewardAvatar: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          type: true,
        },
      },
    },
  });

  return claims.map((claim) => ({
    id: claim.id,
    rewardType: claim.rewardType,
    status: claim.status,
    claimedAt: claim.claimedAt.toISOString(),
    fulfilledAt: claim.fulfilledAt?.toISOString() ?? null,
    victoryPointsAwarded: claim.victoryPointsAwarded,
    user: claim.user,
    battlePass: claim.battlePass,
    level: {
      id: claim.battlePassLevel.id,
      levelNumber: claim.battlePassLevel.levelNumber,
      title: claim.battlePassLevel.title,
      imageUrl: claim.battlePassLevel.imageUrl,
      manualRewardLabel: claim.battlePassLevel.manualRewardLabel,
    },
    rewardAvatar: claim.rewardAvatar,
  }));
};

export const fulfillBattlePassClaimAction = async (input: unknown) => {
  await requireAdmin();
  const parsed = BattlePassClaimIdSchema.parse(input);

  const updated = await prisma.battlePassClaim.update({
    where: { id: parsed.claimId },
    data: {
      status: "FULFILLED",
      fulfilledAt: new Date(),
    },
    select: {
      id: true,
      status: true,
      fulfilledAt: true,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    fulfilledAt: updated.fulfilledAt?.toISOString() ?? null,
  };
};

export const fulfillStoreBattlePassDeliveryAction = async (input: unknown) => {
  await requireAdmin();
  const parsed = BattlePassClaimIdSchema.parse(input);
  const now = new Date();

  const claim = await prisma.battlePassClaim.findFirst({
    where: {
      id: parsed.claimId,
      rewardType: "MANUAL",
      status: "PENDING_FULFILLMENT",
    },
    select: { id: true },
  });

  if (!claim) {
    throw new Error("La entrega no existe o ya no pertenece a un pase activo.");
  }

  const updated = await prisma.battlePassClaim.update({
    where: { id: parsed.claimId },
    data: {
      status: "FULFILLED",
      fulfilledAt: now,
    },
    select: {
      id: true,
      status: true,
      fulfilledAt: true,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    fulfilledAt: updated.fulfilledAt?.toISOString() ?? null,
  };
};

export const fulfillStoreBattlePassDeliveriesAction = async (input: unknown) => {
  await requireAdmin();
  const parsed = FulfillBattlePassClaimsSchema.parse(input);
  const claimIds = Array.from(new Set(parsed.claimIds));
  const now = new Date();

  const count = await prisma.$transaction(async (tx) => {
    const claims = await tx.battlePassClaim.findMany({
      where: {
        id: { in: claimIds },
      },
      select: {
        id: true,
        userId: true,
        rewardType: true,
        status: true,
      },
    });

    if (claims.length !== claimIds.length) {
      throw new Error("Una o mas recompensas seleccionadas no existen.");
    }

    const invalidClaim = claims.find(
      (claim) =>
        claim.userId !== parsed.userId ||
        claim.rewardType !== "MANUAL" ||
        claim.status !== "PENDING_FULFILLMENT",
    );

    if (invalidClaim) {
      throw new Error(
        "Solo puedes entregar recompensas pendientes de tienda para este jugador.",
      );
    }

    const updated = await tx.battlePassClaim.updateMany({
      where: {
        id: { in: claimIds },
        userId: parsed.userId,
        rewardType: "MANUAL",
        status: "PENDING_FULFILLMENT",
      },
      data: {
        status: "FULFILLED",
        fulfilledAt: now,
      },
    });

    if (updated.count !== claimIds.length) {
      throw new Error("No se pudieron entregar todas las recompensas.");
    }

    return updated.count;
  });

  return {
    count,
    claimIds,
    fulfilledAt: now.toISOString(),
  };
};
