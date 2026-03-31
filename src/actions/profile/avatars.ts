"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const resolveUserId = async () => {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("No autorizado");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    throw new Error("No autorizado");
  }

  return user.id;
};

const getProfileMedia = async (type: "AVATAR" | "BANNER") => {
  const userId = await resolveUserId();

  return prisma.avatar.findMany({
    where: {
      type,
      OR: [
        { availability: "PUBLIC" },
        { availability: null },
        { userAvatars: { some: { userId } } },
      ],
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      rarity: true,
      availability: true,
      price: true,
      type: true,
    },
    orderBy: { name: "asc" },
  });
};

export const getAvatars = async () => {
  try {
    return await getProfileMedia("AVATAR");
  } catch (error) {
    throw new Error(`No se pudo cargar los avatares ${error}`);
  }
};

export const getProfileBanners = async () => {
  try {
    return await getProfileMedia("BANNER");
  } catch (error) {
    throw new Error(`No se pudo cargar los banners ${error}`);
  }
};
