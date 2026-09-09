"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  ClaimBattlePassRewardSchema,
  type ClaimBattlePassRewardInput,
} from "@/schemas/battle-pass/battle-pass.schema";
import type { Prisma } from "@prisma/client";

const playerLevelSelect = {
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
  rewardAvatar: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
      type: true,
      rarity: true,
    },
  },
} satisfies Prisma.BattlePassLevelSelect;

type PlayerBattlePassLevelPayload = Prisma.BattlePassLevelGetPayload<{
  select: typeof playerLevelSelect;
}>;

export type PlayerBattlePassRewardCosmetic = {
  id: string;
  name: string;
  imageUrl: string;
  type: "AVATAR" | "BANNER";
  rarity: string;
};

export type PlayerBattlePassLevel = {
  id: string;
  levelNumber: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  rewardType: "AVATAR" | "BANNER" | "PV" | "MANUAL";
  victoryPointsReward: number | null;
  manualRewardLabel: string | null;
  rewardAvatar: PlayerBattlePassRewardCosmetic | null;
  unlocked: boolean;
  claimed: boolean;
  claimStatus: "CLAIMED" | "PENDING_FULFILLMENT" | "FULFILLED" | null;
};

export type PlayerBattlePassData = {
  id: string;
  title: string;
  description: string | null;
  seasonNumber: number;
  startsAt: string;
  endsAt: string;
  progress: number;
  maxLevel: number;
  victoryPoints: number;
  levels: PlayerBattlePassLevel[];
};

export type ClaimBattlePassRewardResult = {
  ok: true;
  levelId: string;
  claimStatus: "CLAIMED" | "PENDING_FULFILLMENT" | "FULFILLED";
  victoryPoints: number;
  rewardType: "AVATAR" | "BANNER" | "PV" | "MANUAL";
  rewardAvatar: PlayerBattlePassRewardCosmetic | null;
};

const resolveCurrentUser = async () => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Debes iniciar sesión para ver el pase de batalla.");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      victoryPoints: true,
    },
  });

  if (!user) {
    throw new Error("No se pudo identificar el usuario.");
  }

  return user;
};

const resolveOptionalCurrentUser = async () => {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      victoryPoints: true,
    },
  });
};

const getBattlePassProgress = async ({
  userId,
  startsAt,
  endsAt,
}: {
  userId: string;
  startsAt: Date;
  endsAt: Date;
}) =>
  prisma.tournament.count({
    where: {
      status: "finished",
      date: {
        gte: startsAt,
        lte: endsAt,
      },
      tournamentPlayers: {
        some: {
          userId,
        },
      },
    },
  });

const mapRewardAvatar = (
  avatar: PlayerBattlePassLevelPayload["rewardAvatar"],
): PlayerBattlePassRewardCosmetic | null => {
  if (!avatar || (avatar.type !== "AVATAR" && avatar.type !== "BANNER")) {
    return null;
  }

  return {
    id: avatar.id,
    name: avatar.name,
    imageUrl: avatar.imageUrl,
    type: avatar.type,
    rarity: avatar.rarity,
  };
};

const mapLevel = ({
  level,
  progress,
  claim,
}: {
  level: PlayerBattlePassLevelPayload;
  progress: number;
  claim?: {
    battlePassLevelId: string;
    status: "CLAIMED" | "PENDING_FULFILLMENT" | "FULFILLED";
  };
}): PlayerBattlePassLevel => ({
  id: level.id,
  levelNumber: level.levelNumber,
  title: level.title,
  description: level.description,
  imageUrl: level.imageUrl,
  rewardType: level.rewardType,
  victoryPointsReward: level.victoryPointsReward,
  manualRewardLabel: level.manualRewardLabel,
  rewardAvatar: mapRewardAvatar(level.rewardAvatar),
  unlocked: level.levelNumber <= progress,
  claimed: Boolean(claim),
  claimStatus: claim?.status ?? null,
});

const findActiveBattlePass = async (now: Date) =>
  prisma.battlePass.findFirst({
    where: {
      status: "ACTIVE",
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    select: {
      id: true,
      title: true,
      description: true,
      seasonNumber: true,
      startsAt: true,
      endsAt: true,
      levels: {
        select: playerLevelSelect,
        orderBy: { levelNumber: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

export const getActiveBattlePassAction =
  async (): Promise<PlayerBattlePassData | null> => {
    const user = await resolveOptionalCurrentUser();
    if (!user) {
      return null;
    }

    const now = new Date();
    const pass = await findActiveBattlePass(now);

    if (!pass) {
      return null;
    }

    const [progress, claims] = await Promise.all([
      getBattlePassProgress({
        userId: user.id,
        startsAt: pass.startsAt,
        endsAt: pass.endsAt,
      }),
      prisma.battlePassClaim.findMany({
        where: {
          userId: user.id,
          battlePassId: pass.id,
        },
        select: {
          battlePassLevelId: true,
          status: true,
        },
      }),
    ]);

    const claimByLevelId = new Map(
      claims.map((claim) => [claim.battlePassLevelId, claim]),
    );
    const maxLevel = Math.max(
      0,
      ...pass.levels.map((level) => level.levelNumber),
    );

    return {
      id: pass.id,
      title: pass.title,
      description: pass.description,
      seasonNumber: pass.seasonNumber,
      startsAt: pass.startsAt.toISOString(),
      endsAt: pass.endsAt.toISOString(),
      progress,
      maxLevel,
      victoryPoints: user.victoryPoints ?? 0,
      levels: pass.levels.map((level) =>
        mapLevel({
          level,
          progress,
          claim: claimByLevelId.get(level.id),
        }),
      ),
    };
  };

export const claimBattlePassRewardAction = async (
  input: ClaimBattlePassRewardInput,
): Promise<ClaimBattlePassRewardResult> => {
  const parsed = ClaimBattlePassRewardSchema.parse(input);
  const user = await resolveCurrentUser();
  const now = new Date();

  const level = await prisma.battlePassLevel.findFirst({
    where: {
      id: parsed.levelId,
      battlePass: {
        is: {
          status: "ACTIVE",
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
      },
    },
    select: {
      ...playerLevelSelect,
      battlePass: {
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
        },
      },
    },
  });

  if (!level) {
    throw new Error("La recompensa no esta disponible.");
  }

  const progress = await getBattlePassProgress({
    userId: user.id,
    startsAt: level.battlePass.startsAt,
    endsAt: level.battlePass.endsAt,
  });

  if (level.levelNumber > progress) {
    throw new Error("Aun no has desbloqueado esta recompensa.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingClaim = await tx.battlePassClaim.findFirst({
      where: {
        userId: user.id,
        battlePassLevelId: level.id,
      },
      select: {
        id: true,
      },
    });

    if (existingClaim) {
      throw new Error("Ya reclamaste esta recompensa.");
    }

    let nextVictoryPoints = user.victoryPoints ?? 0;
    let status: "CLAIMED" | "PENDING_FULFILLMENT" = "CLAIMED";

    if (level.rewardType === "AVATAR" || level.rewardType === "BANNER") {
      if (!level.rewardAvatarId || !level.rewardAvatar) {
        throw new Error("La recompensa no tiene un cosmetico asociado.");
      }

      const owned = await tx.userAvatar.findFirst({
        where: {
          userId: user.id,
          avatarId: level.rewardAvatarId,
        },
        select: {
          id: true,
          unlocked: true,
        },
      });

      if (owned) {
        if (!owned.unlocked) {
          await tx.userAvatar.update({
            where: { id: owned.id },
            data: {
              unlocked: true,
              source: "REWARD",
              note: "Recompensa de pase de batalla",
            },
          });
        }
      } else {
        await tx.userAvatar.create({
          data: {
            userId: user.id,
            avatarId: level.rewardAvatarId,
            unlocked: true,
            source: "REWARD",
            note: "Recompensa de pase de batalla",
          },
        });
      }
    }

    if (level.rewardType === "PV") {
      const points = level.victoryPointsReward ?? 0;
      if (points <= 0) {
        throw new Error("La recompensa de PV no esta configurada.");
      }

      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          victoryPoints: {
            increment: points,
          },
        },
        select: {
          victoryPoints: true,
        },
      });

      nextVictoryPoints = updated.victoryPoints ?? nextVictoryPoints;
    }

    if (level.rewardType === "MANUAL") {
      status = "PENDING_FULFILLMENT";
    }

    await tx.battlePassClaim.create({
      data: {
        userId: user.id,
        battlePassId: level.battlePassId,
        battlePassLevelId: level.id,
        rewardType: level.rewardType,
        rewardAvatarId: level.rewardAvatarId,
        victoryPointsAwarded:
          level.rewardType === "PV" ? (level.victoryPointsReward ?? 0) : null,
        status,
        metadata: JSON.stringify({
          levelNumber: level.levelNumber,
          title: level.title,
          manualRewardLabel: level.manualRewardLabel,
        }),
      },
    });

    return {
      nextVictoryPoints,
      status,
    };
  });

  return {
    ok: true,
    levelId: level.id,
    claimStatus: result.status,
    victoryPoints: result.nextVictoryPoints,
    rewardType: level.rewardType,
    rewardAvatar: mapRewardAvatar(level.rewardAvatar),
  };
};
