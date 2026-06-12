"use server";

import { auth } from "@/auth";
import {
  PLAYER_COSMETIC_STORE_ENABLED,
  PLAYER_PROFILE_FRAMES_ENABLED,
} from "@/config/features";
import { prisma } from "@/lib/prisma";
import { CosmeticPurchaseSchema, type CosmeticPurchaseInput } from "@/schemas";
import type { Prisma } from "@prisma/client";

const getCurrentSeasonNumber = async () => {
  const latestSeason = await prisma.eloSeasonHistory.findFirst({
    orderBy: { seasonNumber: "desc" },
    select: { seasonNumber: true },
  });

  return (latestSeason?.seasonNumber ?? 0) + 1;
};

export type PurchaseCosmeticResult = {
  ok: boolean;
  victoryPoints: number;
  cosmeticId: string;
};

export const purchaseCosmeticAction = async (
  input: CosmeticPurchaseInput,
): Promise<PurchaseCosmeticResult> => {
  const parsed = CosmeticPurchaseSchema.parse(input);

  if (!PLAYER_COSMETIC_STORE_ENABLED) {
    throw new Error("La tienda de cosmeticos no esta disponible por ahora.");
  }

  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Debes iniciar sesión para comprar cosméticos.");
  }

  const currentSeasonNumber = await getCurrentSeasonNumber();
  const now = new Date();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, victoryPoints: true },
  });

  if (!user) {
    throw new Error("No se pudo identificar el usuario.");
  }

  const cosmetic = await prisma.avatar.findFirst({
    where: {
      id: parsed.cosmeticId,
      availability: "STORE",
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
      type: true,
      rarity: true,
      price: true,
      isSeasonal: true,
    },
  });

  if (!cosmetic) {
    throw new Error("El cosmetico no esta disponible en la tienda.");
  }

  if (!PLAYER_PROFILE_FRAMES_ENABLED && cosmetic.type === "FRAME") {
    throw new Error("Los marcos de perfil no estan disponibles actualmente.");
  }

  if (cosmetic.rarity === "ASCENDED") {
    throw new Error(
      "Los cosméticos ascendidos no se pueden comprar en tienda.",
    );
  }

  const price = cosmetic.price ?? 0;
  if (price <= 0) {
    throw new Error("Este cosmetico no tiene un precio valido.");
  }

  const alreadyOwned = await prisma.userAvatar.findFirst({
    where: {
      userId: user.id,
      avatarId: cosmetic.id,
      unlocked: true,
    },
    select: { id: true },
  });

  if (alreadyOwned) {
    throw new Error("Ya tienes este cosmetico desbloqueado.");
  }

  if ((user.victoryPoints ?? 0) < price) {
    throw new Error("No tienes suficientes PV para comprar este cosmetico.");
  }

  const updatedUser = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const latestUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { victoryPoints: true },
      });

      if (!latestUser) {
        throw new Error("No se pudo identificar el usuario.");
      }

      if ((latestUser.victoryPoints ?? 0) < price) {
        throw new Error(
          "No tienes suficientes PV para comprar este cosmetico.",
        );
      }

      const secondCheckOwnership = await tx.userAvatar.findFirst({
        where: {
          userId: user.id,
          avatarId: cosmetic.id,
          unlocked: true,
        },
        select: { id: true },
      });

      if (secondCheckOwnership) {
        throw new Error("Ya tienes este cosmetico desbloqueado.");
      }

      await tx.userAvatar.create({
        data: {
          userId: user.id,
          avatarId: cosmetic.id,
          unlocked: true,
          source: "PURCHASE",
          note: cosmetic.isSeasonal
            ? `Compra tienda temporada ${currentSeasonNumber}`
            : "Compra tienda permanente",
        },
      });

      await tx.avatarPurchase.create({
        data: {
          userId: user.id,
          avatarId: cosmetic.id,
          pricePaid: price,
          seasonNumber: cosmetic.isSeasonal ? currentSeasonNumber : null,
          metadata: JSON.stringify({
            cosmeticName: cosmetic.name,
            rarity: cosmetic.rarity,
          }),
        },
      });

      return tx.user.update({
        where: { id: user.id },
        data: {
          victoryPoints: {
            decrement: price,
          },
        },
        select: {
          victoryPoints: true,
        },
      });
    },
  );

  return {
    ok: true,
    victoryPoints: updatedUser.victoryPoints ?? 0,
    cosmeticId: cosmetic.id,
  };
};
