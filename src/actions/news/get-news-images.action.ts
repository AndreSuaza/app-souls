"use server";

import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/auth";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

export async function getNewsImagesAction(): Promise<string[]> {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "news") {
      return [];
    }

    const imagesDirectory = path.join(process.cwd(), "public", "news");
    const entries = await fs.readdir(imagesDirectory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error("[getNewsImagesAction]", error);
    throw new Error("Error cargando las imágenes");
  }
}
