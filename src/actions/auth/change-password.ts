"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ChangePasswordSchema } from "@/schemas";

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export async function changePassword(input: ChangePasswordInput) {
  const parsed = ChangePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.errors[0]?.message ??
        "No se pudo validar la contraseña.",
    };
  }

  const session = await auth();
  if (!session?.user?.idd) {
    return {
      success: false,
      message: "Debes iniciar sesión para continuar.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.idd },
    select: { password: true },
  });

  if (!user?.password) {
    return {
      success: false,
      message: "No se encontró la contraseña actual.",
    };
  }

  // Revalida la contraseña actual para evitar bypass del flujo en dos pasos.
  const isValid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.password,
  );

  if (!isValid) {
    return {
      success: false,
      message: "La contraseña actual no es correcta.",
    };
  }

  // Evita guardar la misma contraseña nuevamente para no generar un cambio falso.
  const isSamePassword = await bcrypt.compare(
    parsed.data.newPassword,
    user.password,
  );

  if (isSamePassword) {
    return {
      success: false,
      message: "La nueva contraseña debe ser diferente a la actual.",
    };
  }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 10);

  await prisma.user.update({
    where: { id: session.user.idd },
    data: { password: hashed },
  });

  return { success: true };
}
