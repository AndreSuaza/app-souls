"use server";

import { sendEmailVerification } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import {
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  VERIFICATION_TOKEN_RESEND_COOLDOWN_MS,
  getVerificationTokenIdentifier,
  getVerificationTokenIdentifiers,
  getVerificationTokenRetryAfterSeconds,
} from "@/lib/verification-token";
import { palabrasProhibidas } from "@/models/inappropriateWords.model";
import { RegisterSchema } from "@/schemas";
import { getAvatarValue } from "@/utils/avatar-image";
import { normalizeEmail } from "@/utils/email";
import { getProfileBannerValue } from "@/utils/profile-banner";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { AuthError } from "next-auth";
import { z } from "zod";

type FormInputs = {
  name: string;
  lastname: string;
  nickname: string;
  image: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type AuthEmailResult = {
  success: boolean;
  message?: string;
  retryAfterSeconds?: number;
};

const emailSchema = z.string().trim().email("Correo no valido.");
const RESEND_COOLDOWN_SECONDS = Math.ceil(
  VERIFICATION_TOKEN_RESEND_COOLDOWN_MS / 1000,
);

function validarNickname(nickname: string): string | null {
  const trimmed = nickname.trim().toLowerCase();

  if (trimmed.length < 3 || trimmed.length > 15)
    return "El nickname debe tener entre 3 y 15 caracteres.";
  if (!/^[a-zA-Z0-9._]+$/.test(trimmed))
    return "Solo se permiten letras, numeros, puntos y guiones bajos.";
  if (/([a-zA-Z0-9._])\1{3,}/.test(trimmed))
    return "No repitas el mismo caracter muchas veces.";
  if (/^\d+$/.test(trimmed)) return "El nickname no puede ser solo numeros.";
  if (/@|www\./.test(trimmed)) return "No se permiten correos o URLs.";
  if (palabrasProhibidas.some((p) => trimmed.includes(p)))
    return "El nickname contiene palabras restringidas.";

  return null;
}

async function createAndSendEmailVerificationToken(
  email: string,
): Promise<AuthEmailResult> {
  const identifiers = getVerificationTokenIdentifiers(
    email,
    "email-verification",
  );
  const now = new Date();

  // Limpia expirados y limita reenvios sin acumular tokens activos.
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
      EMAIL_VERIFICATION_TOKEN_TTL_MS,
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
      identifier: getVerificationTokenIdentifier(email, "email-verification"),
      token,
      expires: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
    },
  });

  const emailResult = await sendEmailVerification(email, token);
  if (!emailResult.success) {
    await prisma.verificationToken.deleteMany({ where: { token } });

    return {
      success: false,
      retryAfterSeconds: RESEND_COOLDOWN_SECONDS,
      message: emailResult.message
        ? `No se pudo enviar el correo de verificacion: ${emailResult.message}`
        : "No se pudo enviar el correo de verificacion. Intenta nuevamente.",
    };
  }

  return { success: true, retryAfterSeconds: RESEND_COOLDOWN_SECONDS };
}

export async function userRegistration(
  formData: FormInputs,
): Promise<AuthEmailResult> {
  try {
    const parsed = RegisterSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors[0]?.message ?? "Datos invalidos.",
      };
    }
    const normalizedData = parsed.data;

    const existsEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedData.email,
          mode: "insensitive",
        },
      },
    });

    if (existsEmail) {
      return {
        success: false,
        message: "Este correo electronico ya esta registrado.",
      };
    }

    if (normalizedData.password !== normalizedData.confirmPassword) {
      return { success: false, message: "Las contrasenas no coinciden." };
    }

    const normalizedNickname = normalizedData.nickname.trim().toLowerCase();
    const nicknameError = validarNickname(normalizedNickname);
    if (nicknameError) {
      return { success: false, message: nicknameError };
    }

    const existsNick = await prisma.user.findUnique({
      where: { nickname: normalizedNickname },
    });

    if (existsNick) {
      return {
        success: false,
        message: "Este nickname ya esta en uso.",
      };
    }

    const passwordHash = await bcrypt.hash(normalizedData.password, 10);

    const userdb = await prisma.user.create({
      data: {
        name: normalizedData.name,
        lastname: normalizedData.lastname,
        email: normalizedData.email,
        nickname: normalizedNickname,
        password: passwordHash,
        image: getAvatarValue(),
        bannerImage: getProfileBannerValue(),
      },
    });

    if (userdb.email) {
      const emailResult = await createAndSendEmailVerificationToken(userdb.email);

      if (!emailResult.success) {
        await prisma.user.delete({ where: { id: userdb.id } });
        return emailResult;
      }

      return emailResult;
    }

    return { success: true, retryAfterSeconds: RESEND_COOLDOWN_SECONDS };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message:
          error.cause?.err?.message ??
          "No se pudo completar el registro. Intenta nuevamente.",
      };
    }
    return {
      success: false,
      message: "No se pudo completar el registro. Intenta nuevamente.",
    };
  }
}

export async function resendEmailVerification(
  email: string,
): Promise<AuthEmailResult> {
  try {
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      return { success: false, message: parsedEmail.error.errors[0]?.message };
    }

    const normalizedEmail = normalizeEmail(parsedEmail.data);
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
      select: { email: true, emailVerified: true },
    });

    if (!user?.email || user.emailVerified) {
      return { success: true, retryAfterSeconds: RESEND_COOLDOWN_SECONDS };
    }

    return createAndSendEmailVerificationToken(user.email);
  } catch (error) {
    console.error("Error en resendEmailVerification:", error);
    return {
      success: false,
      message: "No se pudo reenviar el correo de verificacion.",
    };
  }
}
