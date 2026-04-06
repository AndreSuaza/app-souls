"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileBannerSchema } from "@/schemas";
import { getProfileBannerValue } from "@/utils/profile-banner";
import { toBlobPath, toBlobUrl } from "@/utils/blob-path";

const buildBannerCandidates = (value: string) => {
  const normalized = getProfileBannerValue(value);
  const path = toBlobPath(normalized);
  const url = toBlobUrl(normalized);

  return Array.from(new Set([normalized, path, url].filter(Boolean)));
};

export const updateUserBanner = async (bannerImage: string) => {
  const session = await auth();

  if (!session?.user.email) {
    throw new Error("Error en la sesion");
  }

  const parsed = ProfileBannerSchema.parse({ bannerImage });

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        bannerImage: true,
      },
    });

    if (!user) {
      throw new Error("Error en la sesion del Usuario");
    }

    const candidates = buildBannerCandidates(parsed.bannerImage);

    const banner = await prisma.avatar.findFirst({
      where: {
        type: "BANNER",
        imageUrl: { in: candidates },
      },
      select: {
        id: true,
        availability: true,
      },
    });

    if (!banner) {
      throw new Error("El banner seleccionado no esta disponible");
    }

    const isPublicBanner =
      banner.availability === "PUBLIC" || banner.availability === null;

    if (!isPublicBanner) {
      const ownsBanner = await prisma.userAvatar.findFirst({
        where: {
          userId: user.id,
          avatarId: banner.id,
        },
        select: { id: true },
      });

      if (!ownsBanner) {
        throw new Error("No tienes este banner disponible");
      }
    }

    const nextBanner = candidates[0] ?? parsed.bannerImage;

    if (user.bannerImage === nextBanner) {
      throw new Error("No hay cambios en el banner");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        bannerImage: nextBanner,
      },
    });
  } catch (error) {
    throw new Error(`Error en la sesion ${error}`);
  }
};
