"use server";

import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { sendPasswordResetEmail } from "@/lib/mail";
import {
  PASSWORD_RESET_TOKEN_TTL_MS,
  VERIFICATION_TOKEN_RESEND_COOLDOWN_MS,
  getVerificationTokenIdentifier,
  getVerificationTokenIdentifiers,
  getVerificationTokenRetryAfterSeconds,
} from "@/lib/verification-token";
import { normalizeEmail } from "@/utils/email";

const RESEND_COOLDOWN_SECONDS = Math.ceil(
  VERIFICATION_TOKEN_RESEND_COOLDOWN_MS / 1000,
);

type PasswordResetRequestResult = {
  success: boolean;
  message?: string;
  retryAfterSeconds?: number;
};

export async function requestPasswordReset(
  email: string,
): Promise<PasswordResetRequestResult> {
  try {
    const normalizedEmail = normalizeEmail(email);

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
      select: { email: true },
    });

    if (!user?.email) {
      return { success: true, retryAfterSeconds: RESEND_COOLDOWN_SECONDS };
    }

    const identifiers = getVerificationTokenIdentifiers(
      user.email,
      "password-reset",
    );
    const now = new Date();

    // Limpia expirados y evita multiples envios seguidos para el mismo correo.
    await prisma.verificationToken.deleteMany({
      where: { expires: { lt: now } },
    });

    const activeToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: { in: identifiers },
        expires: { gt: now },
      },
      select: { expires: true },
    });

    if (activeToken) {
      const retryAfterSeconds = getVerificationTokenRetryAfterSeconds(
        activeToken.expires,
        PASSWORD_RESET_TOKEN_TTL_MS,
        now,
      );

      if (retryAfterSeconds > 0) {
        return { success: true, retryAfterSeconds };
      }
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: { in: identifiers } },
    });

    const token = nanoid();

    await prisma.verificationToken.create({
      data: {
        identifier: getVerificationTokenIdentifier(user.email, "password-reset"),
        token,
        expires: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
      },
    });

    const emailResult = await sendPasswordResetEmail(user.email, token);
    if (!emailResult.success) {
      await prisma.verificationToken.deleteMany({ where: { token } });
      return {
        success: false,
        retryAfterSeconds: RESEND_COOLDOWN_SECONDS,
        message: emailResult.message
          ? `Error al enviar el correo: ${emailResult.message}`
          : "Error al enviar el correo.",
      };
    }

    return { success: true, retryAfterSeconds: RESEND_COOLDOWN_SECONDS };
  } catch (err) {
    console.error("Error en request-password-reset:", err);
    return { success: false, message: "Error al procesar la solicitud." };
  }
}
