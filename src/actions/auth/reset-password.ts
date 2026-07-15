"use server";

import { prisma } from "@/lib/prisma";
import {
  isVerificationTokenForPurpose,
  resolveVerificationTokenEmail,
} from "@/lib/verification-token";
import bcrypt from "bcryptjs";

export async function resetPassword(token: string, newPassword: string) {
  try {
    // buscar token
    const storedToken = await prisma.verificationToken.findFirst({
      where: { token },
    });

    // token inválido o expirado
    if (!storedToken) {
      return { success: false, message: "Token inválido o expirado." };
    }

    if (
      !isVerificationTokenForPurpose(storedToken.identifier, "password-reset")
    ) {
      return { success: false, message: "Token inválido o expirado." };
    }

    if (storedToken.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { token } });
      return { success: false, message: "Token inválido o expirado." };
    }

    const email = resolveVerificationTokenEmail(storedToken.identifier);
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (!user) {
      await prisma.verificationToken.deleteMany({ where: { token } });
      return { success: false, message: "Token inválido o expirado." };
    }

    // encriptar nueva contraseña
    const hashed = await bcrypt.hash(newPassword, 10);

    // actualizar contraseña del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    // eliminar token usado
    await prisma.verificationToken.deleteMany({
      where: { token },
    });

    return { success: true };
  } catch (err) {
    console.error("Error en resetPassword:", err);
    return { success: false, message: "Error al restablecer la contraseña." };
  }
}
