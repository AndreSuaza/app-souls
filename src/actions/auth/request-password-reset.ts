"use server";

import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function requestPasswordReset(email: string) {
  try {
    // buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // No revelar si el usuario no existe
    if (!user) {
      return { success: true };
    }

    // Eliminar tokens previos de recuperación
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // crea token nuevo
    const token = nanoid();

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 30), // 30 minutos
      },
    });

    await sendPasswordResetEmail(email, token);

    return { success: true };
  } catch (err) {
    console.log("Error en request-password-reset:", err);
    return { success: false, message: "Error al procesar la solicitud." };
  }
}
