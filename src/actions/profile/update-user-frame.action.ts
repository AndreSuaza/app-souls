"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileFrameSchema } from "@/schemas";
import { getProfileFrameValue } from "@/utils/profile-frame";
import { toBlobPath, toBlobUrl } from "@/utils/blob-path";

const buildFrameCandidates = (value: string) => {
  const normalized = getProfileFrameValue(value);
  const path = toBlobPath(normalized);
  const url = toBlobUrl(normalized);

  return Array.from(new Set([normalized, path, url].filter(Boolean)));
};

export const updateUserFrame = async (frameImage: string | null) => {
  const session = await auth();

  if (!session?.user.email) {
    throw new Error("Error en la sesion");
  }

  const parsed = ProfileFrameSchema.parse({ frameImage });

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        frameImage: true,
      },
    });

    if (!user) {
      throw new Error("Error en la sesion del Usuario");
    }

    if (!parsed.frameImage) {
      if (!user.frameImage) return;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          frameImage: null,
        },
      });
      return;
    }

    const candidates = buildFrameCandidates(parsed.frameImage);

    const frame = await prisma.avatar.findFirst({
      where: {
        type: "FRAME",
        imageUrl: { in: candidates },
      },
      select: {
        id: true,
        availability: true,
      },
    });

    if (!frame) {
      throw new Error("El marco seleccionado no esta disponible");
    }

    const isPublicFrame =
      frame.availability === "PUBLIC" || frame.availability === null;

    if (!isPublicFrame) {
      const ownsFrame = await prisma.userAvatar.findFirst({
        where: {
          userId: user.id,
          avatarId: frame.id,
        },
        select: { id: true },
      });

      if (!ownsFrame) {
        throw new Error("No tienes este marco disponible");
      }
    }

    const nextFrame = candidates[0] ?? parsed.frameImage;

    if (user.frameImage === nextFrame) {
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        frameImage: nextFrame,
      },
    });
  } catch (error) {
    throw new Error(`Error en la sesion ${error}`);
  }
};
