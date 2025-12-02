import type { NextAuthConfig } from "next-auth";

import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { sendEmailVerification } from "./lib/mail";

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

        // verificar si existe el usuario en la base de datos
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
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
          const verifyTokenExits = await prisma.verificationToken.findFirst({
            where: {
              identifier: user.email,
            },
          });

          // si existe un token, lo eliminamos
          if (verifyTokenExits?.identifier) {
            await prisma.verificationToken.delete({
              where: {
                identifier: user.email,
              },
            });
          }

          const token = nanoid();

          await prisma.verificationToken.create({
            data: {
              identifier: user.email,
              token,
              expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
          });

          // enviar email de verificación
          await sendEmailVerification(user.email, token);

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
