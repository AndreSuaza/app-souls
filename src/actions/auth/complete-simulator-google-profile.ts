"use server";

import { Prisma } from "@prisma/client";
import { createSimulatorOAuthCode } from "@/lib/simulator-oauth";
import {
  consumeSimulatorProfileTicket,
  findSimulatorProfileTicket,
} from "@/lib/simulator-google-oauth";
import { prisma } from "@/lib/prisma";
import { CompleteGoogleProfileSchema } from "@/schemas";
import { validateNickname } from "@/utils/nickname";

type CompleteSimulatorGoogleProfileResult = {
  success: boolean;
  message?: string;
  redirectUrl?: string;
};

function simulatorCallbackUrl(state: string) {
  const origin = process.env.SIMULATOR_WEB_ORIGIN?.trim();
  if (!origin) return null;
  const callback = new URL("/auth/google/callback", origin);
  callback.searchParams.set("state", state);
  return callback;
}

export async function completeSimulatorGoogleProfile(
  ticket: string,
  input: unknown,
): Promise<CompleteSimulatorGoogleProfileResult> {
  const profileTicket = ticket.trim();
  if (!profileTicket) {
    return { success: false, message: "El enlace de registro no es válido." };
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

  const transaction = await findSimulatorProfileTicket(profileTicket);
  if (!transaction?.userId || !transaction.user) {
    return {
      success: false,
      message: "El enlace de registro expiró. Inicia sesión con Google nuevamente.",
    };
  }

  if (transaction.user.status !== "active") {
    return { success: false, message: "Tu cuenta está inactiva. Contacta con soporte." };
  }

  try {
    const existingNickname = await prisma.user.findFirst({
      where: {
        id: { not: transaction.userId },
        nickname: { equals: normalizedNickname, mode: "insensitive" },
      },
      select: { id: true },
    });

    if (existingNickname) {
      return { success: false, message: "Este nickname ya está en uso." };
    }

    await prisma.user.update({
      where: { id: transaction.userId },
      data: {
        lastname: parsed.data.lastname.trim(),
        name: parsed.data.name.trim(),
        nickname: normalizedNickname,
        profileCompleted: true,
      },
    });

    const consumed = await consumeSimulatorProfileTicket(
      transaction.id,
      profileTicket,
    );
    if (!consumed) {
      return {
        success: false,
        message: "El enlace de registro expiró. Inicia sesión con Google nuevamente.",
      };
    }

    const code = await createSimulatorOAuthCode(transaction.userId);
    const callback = simulatorCallbackUrl(transaction.simulatorState);
    if (!callback) {
      return {
        success: false,
        message: "El simulador no tiene un origen configurado.",
      };
    }
    callback.searchParams.set("code", code);

    return { success: true, redirectUrl: callback.toString() };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, message: "Este nickname ya está en uso." };
    }

    console.error("[complete-simulator-google-profile]", error);
    return {
      success: false,
      message: "No se pudo completar el perfil. Intenta nuevamente.",
    };
  }
}
