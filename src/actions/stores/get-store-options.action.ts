"use server";

import { prisma } from "@/lib/prisma";

export const getStoreOptionsAction = async () => {
  try {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: [
        {
          name: "asc",
        },
      ],
    });

    return stores;
  } catch (error) {
    console.error("[getStoreOptionsAction]", error);
    throw new Error("No se pudo cargar las tiendas");
  }
};
