"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CompleteGoogleProfileSchema } from "@/schemas";
import { validateNickname } from "@/utils/nickname";
import { Prisma } from "@prisma/client";

type CompleteGoogleProfileResult = {
  success: boolean;
  message?: string;
};

export async function completeGoogleProfile(
  input: unknown,
): Promise<CompleteGoogleProfileResult> {
  const session = await auth();
  const userId = session?.user?.idd;
  if (!userId) {
    return { success: false, message: "Tu sesión no está disponible." };
  }

  const parsed = CompleteGoogleProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message ?? "Datos inválidos.",
    };
  }

  const normalizedNickname = parsed.data.nickname.trim().toLowerCase();
  const nicknameError = validateNickname(normalizedNickname);
  if (nicknameError) return { success: false, message: nicknameError };

  try {
    const existingNickname = await prisma.user.findFirst({
      where: {
        id: { not: userId },
        nickname: { equals: normalizedNickname, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (existingNickname) {
      return { success: false, message: "Este nickname ya está en uso." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name.trim(),
        lastname: parsed.data.lastname.trim(),
        nickname: normalizedNickname,
        profileCompleted: true,
      },
    });

    return { success: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, message: "Este nickname ya está en uso." };
    }

    console.error("[complete-google-profile]", error);
    return {
      success: false,
      message: "No se pudo completar el perfil. Intenta nuevamente.",
    };
  }
}
