"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getPasswordStatus() {
  const session = await auth();
  if (!session?.user?.idd) return { hasPassword: false };

  const user = await prisma.user.findUnique({
    where: { id: session.user.idd },
    select: { password: true },
  });

  return { hasPassword: Boolean(user?.password) };
}
