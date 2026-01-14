"use server";

import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SearchUsersSchema, SearchUsersInput } from "@/schemas";

export async function searchUsersAction(input: SearchUsersInput) {
  try {
    const { search } = SearchUsersSchema.parse(input);
    if (!search) return [];

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            nickname: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            lastname: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
        role: Role.player,
      },
      select: {
        id: true,
        nickname: true,
        name: true,
        lastname: true,
        image: true,
      },
      take: 10,
    });

    if (users.length === 0) return [];

    return users;
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[searchUsersAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error ? error.message : "Error al buscar usuarios"
    );
  }
}
