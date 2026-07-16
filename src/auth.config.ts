import type { NextAuthConfig } from "next-auth";

import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { sendEmailVerification } from "./lib/mail";
import {
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  getVerificationTokenIdentifier,
  getVerificationTokenIdentifiers,
} from "./lib/verification-token";
import { normalizeEmail } from "./utils/email";

export const runtime = "nodejs";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    // Google,
    // GitHub,
    Credentials({
      authorize: async (credentials) => {
        if (!credentials.email || !credentials.password) {
          throw new Error("Correo o contraseña incorrectos.");
        }

        if (
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          throw new Error("Correo o contraseña incorrectos.");
        }

        const normalizedEmail = normalizeEmail(credentials.email);

        // verificar si existe el usuario en la base de datos
        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: normalizedEmail,
              mode: "insensitive",
            },
          },
        });

        if (!user || !user.password || !user.email) {
          throw new Error("Correo o contraseña incorrectos.");
        }

        // Verificar si el usuario está activo o banneado
        if (user.status === "inactive" || user.status === "banned") {
          throw new Error("Tu cuenta está inactiva. Contacta con soporte.");
        }

        // verificar si la contraseña es correcta
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Contraseña incorrecta. Intenta de nuevo.");
        }

        // verificación de email
        if (!user.emailVerified) {
          const tokenIdentifiers = getVerificationTokenIdentifiers(
            user.email,
            "email-verification",
          );

          // Si existe un token o hay tokens expirados, los eliminamos.
          await prisma.verificationToken.deleteMany({
            where: {
              OR: [
                { expires: { lt: new Date() } },
                { identifier: { in: tokenIdentifiers } },
              ],
            },
          });

          const token = nanoid();

          await prisma.verificationToken.create({
            data: {
              identifier: getVerificationTokenIdentifier(
                user.email,
                "email-verification",
              ),
              token,
              expires: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
            },
          });

          // enviar email de verificación
          const emailResult = await sendEmailVerification(user.email, token);
          if (!emailResult.success) {
            await prisma.verificationToken.deleteMany({ where: { token } });
            throw new Error(
              emailResult.message
                ? `No se pudo enviar el correo de verificación: ${emailResult.message}`
                : "No se pudo enviar el correo de verificación. Intenta nuevamente."
            );
          }

          throw new Error(
            "Tu cuenta no ha sido verificada. Revisa tu correo electrónico."
          );
        }

        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
