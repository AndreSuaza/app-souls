"use server";

import { prisma } from "@/lib/prisma";

export async function searchUserByNickname(nickname: string) {
  const search = nickname.trim();
  if (!search) return [];

  return prisma.user.findMany({
    where: {
      nickname: {
        contains: nickname,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      nickname: true,
    },
    take: 10,
  });
}
