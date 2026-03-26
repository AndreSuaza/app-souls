"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileBannerSchema } from "@/schemas";

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
    });

    if (!user) {
      throw new Error("Error en la sesion del Usuario");
    }

    if (user.bannerImage === parsed.bannerImage) {
      throw new Error("No hay cambios en el banner");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        bannerImage: parsed.bannerImage,
      },
    });
  } catch (error) {
    throw new Error(`Error en la sesion ${error}`);
  }
};
