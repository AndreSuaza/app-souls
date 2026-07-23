"use server";

import { auth } from "@/auth";
import type { EventImageOptions } from "@/interfaces/events.interface";
import { listAssets } from "@/lib/assets-storage";

const mapToPathnames = (items: { pathname: string; url: string }[]) =>
  items
    .sort((a, b) => a.pathname.localeCompare(b.pathname))
    .map((item) => item.pathname);

export async function getEventImagesAction(): Promise<EventImageOptions> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const [banners, cards] = await Promise.all([
      listAssets("events/banners/"),
      listAssets("events/cards/"),
    ]);

    return {
      banners: mapToPathnames(banners),
      cards: mapToPathnames(cards),
    };
  } catch (error) {
    console.error("[getEventImagesAction]", error);
    throw new Error("Error cargando las imagenes");
  }
}
