"use server";

import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/auth";
import type { NewsImageOptions } from "@/interfaces";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

type ImageFolder = "banners" | "cards";

const readImagesInFolder = async (folder: ImageFolder) => {
  const imagesDirectory = path.join(process.cwd(), "public", "news", folder);
  try {
    const entries = await fs.readdir(imagesDirectory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // Evita fallar si aún no existe la carpeta de imágenes.
      return [];
    }
    throw error;
  }
};

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
      readImagesInFolder("banners"),
      readImagesInFolder("cards"),
    ]);

    return { banners, cards };
  } catch (error) {
    console.error("[getNewsImagesAction]", error);
    throw new Error("Error cargando las imágenes");
  }
}
