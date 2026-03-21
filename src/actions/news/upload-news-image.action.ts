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
      throw new Error("Archivo inválido");
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Solo se permiten imágenes");
    }

    const maxSize = MAX_SIZE_BYTES[folder];
    if (file.size > maxSize) {
      throw new Error(
        `La imagen supera el límite de ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
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
    // Propaga el mensaje real para mostrar el motivo exacto en UI.
    throw new Error(
      error instanceof Error ? error.message : "Error subiendo la imagen",
    );
  }
}
