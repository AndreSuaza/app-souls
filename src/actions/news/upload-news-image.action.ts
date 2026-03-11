"use server";

import { z } from "zod";
import sharp from "sharp";
import { auth } from "@/auth";
import { uploadBlob } from "@/lib/blob";

const FolderSchema = z.enum(["banners", "cards"]);

const MAX_SIZE_BYTES = {
  banners: 8 * 1024 * 1024,
  cards: 4 * 1024 * 1024,
} as const;

const buildSafeName = (name: string) => {
  const base = name.replace(/\.[^/.]+$/, "");
  const normalized = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return normalized || "imagen";
};

export async function uploadNewsImageAction(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("No autorizado");
    }

    if (session.user.role !== "admin" && session.user.role !== "news") {
      throw new Error("No autorizado");
    }

    const folderValue = formData.get("folder");
    const file = formData.get("file");
    const folder = FolderSchema.parse(folderValue);

    if (!(file instanceof File)) {
      throw new Error("Archivo invÃ¡lido");
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Solo se permiten imÃ¡genes");
    }

    const maxSize = MAX_SIZE_BYTES[folder];
    if (file.size > maxSize) {
      throw new Error(
        `La imagen supera el lÃ­mite de ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    // Convertimos siempre a WebP para unificar formato y optimizar peso.
    const outputBuffer = await sharp(inputBuffer)
      .webp({ quality: 85 })
      .toBuffer();

    const safeName = buildSafeName(file.name);
    const uniqueSuffix = crypto.randomUUID();
    const filename = `${safeName}-${uniqueSuffix}.webp`;

    const path = `souls/news/${folder}/${filename}`;
    const blob = await uploadBlob({
      path,
      buffer: outputBuffer,
      contentType: "image/webp",
    });

    return { url: blob.url };
  } catch (error) {
    console.error("[uploadNewsImageAction]", error);
    throw new Error("Error subiendo la imagen");
  }
}
