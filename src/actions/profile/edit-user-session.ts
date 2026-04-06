"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileAvatarSchema } from "@/schemas";
import { getAvatarValue } from "@/utils/avatar-image";
import { toBlobPath, toBlobUrl } from "@/utils/blob-path";

const buildAvatarCandidates = (value: string) => {
  const normalized = getAvatarValue(value);
  const path = toBlobPath(normalized);
  const url = toBlobUrl(normalized);

  return Array.from(new Set([normalized, path, url].filter(Boolean)));
};

export const updateUser = async (img: string) => {
  const session = await auth();

  if (!session?.user.email) {
    throw new Error("Error en la sesion");
  }

  const parsed = ProfileAvatarSchema.parse({ avatarImage: img });

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        image: true,
      },
    });

    if (!user) {
      throw new Error("Error en la sesion del Usuario");
    }

    const candidates = buildAvatarCandidates(parsed.avatarImage);

    const avatar = await prisma.avatar.findFirst({
      where: {
        type: "AVATAR",
        imageUrl: { in: candidates },
      },
      select: {
        id: true,
        availability: true,
      },
    });

    if (!avatar) {
      throw new Error("El avatar seleccionado no esta disponible");
    }

    const isPublicAvatar =
      avatar.availability === "PUBLIC" || avatar.availability === null;

    if (!isPublicAvatar) {
      const ownsAvatar = await prisma.userAvatar.findFirst({
        where: {
          userId: user.id,
          avatarId: avatar.id,
        },
        select: { id: true },
      });

      if (!ownsAvatar) {
        throw new Error("No tienes este avatar disponible");
      }
    }

    const nextAvatar = candidates[0] ?? parsed.avatarImage;

    if (user.image === nextAvatar) {
      throw new Error("No hay cambios en la imagen");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        image: nextAvatar,
      },
    });
  } catch (error) {
    throw new Error(`Error en la sesion ${error}`);
  }
};
