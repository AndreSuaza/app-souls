"use server";

import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/auth";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

export async function getProductImagesAction(): Promise<string[]> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return [];
    }

    const imagesDirectory = path.join(process.cwd(), "public", "products");
    try {
      const entries = await fs.readdir(imagesDirectory, {
        withFileTypes: true,
      });

      return entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) =>
          IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()),
        )
        .sort((a, b) => a.localeCompare(b));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // Evita fallar si la carpeta de productos aún no existe.
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error("[getProductImagesAction]", error);
    throw new Error("Error cargando las imágenes del producto");
  }
}
