"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VerifyCurrentPasswordSchema } from "@/schemas";

type VerifyCurrentPasswordInput = {
  currentPassword: string;
};

export async function verifyCurrentPassword(
  input: VerifyCurrentPasswordInput,
) {
  const parsed = VerifyCurrentPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.errors[0]?.message ??
        "La contraseña actual no es válida.",
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

  return { success: true };
}
