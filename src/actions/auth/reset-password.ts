"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function resetPassword(token: string, newPassword: string) {
  try {
    // buscar token
    const storedToken = await prisma.verificationToken.findFirst({
      where: { token },
    });

    // token inválido o expirado
    if (!storedToken || storedToken.expires < new Date()) {
      return { success: false, message: "Token inválido o expirado." };
    }

    // encriptar nueva contraseña
    const hashed = await bcrypt.hash(newPassword, 10);

    // actualizar contraseña del usuario
    await prisma.user.update({
      where: { email: storedToken.identifier },
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
