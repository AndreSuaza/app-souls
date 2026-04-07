"use server";

import { prisma } from "@/lib/prisma";
import { PublicProfileSchema } from "@/schemas";

type PublicProfileInput = {
  nickname: string;
};

export const getPublicProfileAction = async (
  input: PublicProfileInput,
) => {
  const parsed = PublicProfileSchema.safeParse(input);
  if (!parsed.success) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { nickname: parsed.data.nickname },
    select: {
      id: true,
      nickname: true,
      name: true,
      lastname: true,
      image: true,
      bannerImage: true,
      matchesPlayed: true,
      eloPoints: true,
      tournamentsPlayed: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    nickname: user.nickname,
    name: user.name,
    lastname: user.lastname,
    image: user.image,
    bannerImage: user.bannerImage,
    matchesPlayed: user.matchesPlayed ?? 0,
    eloPoints: user.eloPoints ?? 0,
    tournamentsPlayed: user.tournamentsPlayed ?? 0,
  };
};
