"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const getUserById = async () => {
  const session = await auth();

  if (!session?.user.email) {
    throw new Error(`Error en la sesion`);
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session?.user.email,
      },
    });

    return {
      name: user?.name,
      lastname: user?.lastname,
      email: user?.email,
      nickname: user?.nickname,
      image: user?.image,
      role: user?.role,
      victoryPoints: user?.victoryPoints,
    };
  } catch (error) {
    throw new Error(`Error en la sesion ${error}`);
  }
};
