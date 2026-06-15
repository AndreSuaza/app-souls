"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const EventIdSchema = z.string().min(1);

export async function deleteEventAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const eventId = EventIdSchema.parse(id);

    const existing = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, slug: true, status: true },
    });

    if (!existing || existing.status === "deleted") {
      throw new Error("Evento no encontrado");
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: "deleted",
        slug: `${existing.slug}-deleted-${eventId}`,
      },
    });

    return true;
  } catch (error) {
    console.error("[deleteEventAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error eliminando evento",
    );
  }
}
