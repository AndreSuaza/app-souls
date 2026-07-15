"use server";

import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { sendPasswordResetEmail } from "@/lib/mail";
import {
  PASSWORD_RESET_TOKEN_TTL_MS,
  getVerificationTokenIdentifier,
  getVerificationTokenIdentifiers,
} from "@/lib/verification-token";
import { normalizeEmail } from "@/utils/email";

export async function requestPasswordReset(email: string) {
  try {
    const normalizedEmail = normalizeEmail(email);

    // buscar usuario por email
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
      select: { email: true },
    });

    // No revelar si el usuario no existe
    if (!user?.email) {
      return { success: true };
    }

    // Eliminar tokens previos de recuperación
    await prisma.verificationToken.deleteMany({
      where: {
        OR: [
          { expires: { lt: new Date() } },
          {
            identifier: {
              in: getVerificationTokenIdentifiers(
                user.email,
                "password-reset",
              ),
            },
          },
        ],
      },
    });

    // crea token nuevo
    const token = nanoid();

    await prisma.verificationToken.create({
      data: {
        identifier: getVerificationTokenIdentifier(user.email, "password-reset"),
        token,
        expires: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS), // 30 minutos
      },
    });

    const emailResult = await sendPasswordResetEmail(user.email, token);
    if (!emailResult.success) {
      await prisma.verificationToken.deleteMany({ where: { token } });
      return {
        success: false,
        message: emailResult.message
          ? `Error al enviar el correo: ${emailResult.message}`
          : "Error al enviar el correo.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Error en request-password-reset:", err);
    return { success: false, message: "Error al procesar la solicitud." };
  }
}
