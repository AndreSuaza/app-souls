"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { closeCompetitiveSeasonAction } from "./competitive-season.action";
import { ResetEloSeasonSchema, type ResetEloSeasonInput } from "@/schemas";

type ResetEloSeasonResult = {
  ok: boolean;
  seasonNumber: number;
  updatedUsers: number;
};

export const resetEloSeasonAction = async (
  input: ResetEloSeasonInput = {},
): Promise<ResetEloSeasonResult> => {
  const parsed = ResetEloSeasonSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, seasonNumber: 0, updatedUsers: 0 };
  }

  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("No autorizado para reiniciar Elo.");
  }

  let activeSeason = await prisma.competitiveSeason.findFirst({
    where: { status: "ACTIVE" },
    select: { id: true, seasonNumber: true },
    orderBy: { seasonNumber: "desc" },
  });
  if (!activeSeason) {
    activeSeason = await prisma.$transaction(async (tx) => {
      const latest = await tx.competitiveSeason.findFirst({
        orderBy: { seasonNumber: "desc" },
        select: { seasonNumber: true },
      });
      return tx.competitiveSeason.create({
        data: {
          seasonNumber: (latest?.seasonNumber ?? 0) + 1,
          name: `Temporada ${(latest?.seasonNumber ?? 0) + 1}`,
          status: "ACTIVE",
          startsAt: new Date(),
          activatedAt: new Date(),
        },
        select: { id: true, seasonNumber: true },
      });
    });
  }

  const players = await prisma.user.count({ where: { role: "player" } });
  await closeCompetitiveSeasonAction({ seasonId: activeSeason.id });

  return {
    ok: true,
    seasonNumber: activeSeason.seasonNumber,
    updatedUsers: players,
  };
};
