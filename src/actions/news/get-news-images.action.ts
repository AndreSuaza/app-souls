"use server";

import { auth } from "@/auth";
import { listBlob } from "@/lib/blob";
import type { NewsImageOptions } from "@/interfaces";

const mapToPathnames = (items: { pathname: string; url: string }[]) =>
  items
    .sort((a, b) => a.pathname.localeCompare(b.pathname))
    .map((item) => item.pathname);

export async function getNewsImagesAction(): Promise<NewsImageOptions> {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "news") {
      return { banners: [], cards: [] };
    }

    const [banners, cards] = await Promise.all([
      listBlob("souls/news/banners/"),
      listBlob("souls/news/cards/"),
    ]);

    return {
      banners: mapToPathnames(banners),
      cards: mapToPathnames(cards),
    };
  } catch (error) {
    console.error("[getNewsImagesAction]", error);
    throw new Error("Error cargando las imágenes");
  }
}
