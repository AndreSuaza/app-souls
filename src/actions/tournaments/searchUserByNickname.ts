"use server";

import { prisma } from "@/lib/prisma";

export async function searchUserByNickname_action(nickname: string) {
  if (!nickname.trim()) return [];

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
