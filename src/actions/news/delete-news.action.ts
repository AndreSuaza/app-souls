"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const NewsIdSchema = z.string().min(1);

export async function deleteNewsAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "news") {
      throw new Error("No autorizado");
    }

    const newsId = NewsIdSchema.parse(id);

    await prisma.new.delete({
      where: { id: newsId },
    });

    return true;
  } catch (error) {
    console.error("[deleteNewsAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error eliminando noticia",
    );
  }
}
