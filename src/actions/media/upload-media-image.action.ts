"use server";

import { auth } from "@/auth";
import { listAssets, uploadAsset } from "@/lib/assets-storage";
import { MEDIA_SECTION_CONFIG } from "@/models/media.models";
import { MediaSectionSchema } from "@/schemas";
import sharp from "sharp";

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

export async function uploadMediaImageAction(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const sectionValue = formData.get("section");
    const file = formData.get("file");
    const section = MediaSectionSchema.parse(sectionValue);
    const config = MEDIA_SECTION_CONFIG[section];

    if (!config.allowUpload) {
      throw new Error("Esta secciÃ³n no admite cargas por ahora");
    }

    if (!(file instanceof File)) {
      throw new Error("Archivo invÃ¡lido");
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Solo se permiten imÃ¡genes");
    }

    const maxBytes = config.maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error(`La imagen supera el lÃ­mite de ${config.maxSizeMb}MB`);
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const isWebp = file.type === "image/webp";
    const outputBuffer =
      section === "products" && isWebp
        ? inputBuffer
        : await sharp(inputBuffer).webp({ quality: 92 }).toBuffer();

    const safeName = buildSafeName(file.name);
    let filename = `${safeName}-${crypto.randomUUID()}.webp`;

    if (section === "products") {
      // Para productos usamos el nombre base sin UUID y evitamos sobrescrituras.
      filename = `${safeName}.webp`;
      const existing = await listAssets(`${config.folder}/`);
      const exists = existing.some((item) => item.pathname.endsWith(filename));
      if (exists) {
        throw new Error(
          "Ya existe una imagen con ese nombre. Elimina la anterior antes de subir una nueva.",
        );
      }
    }

    const path = `${config.folder}/${filename}`;

    const asset = await uploadAsset({
      path,
      buffer: outputBuffer,
      contentType: "image/webp",
      cacheControl:
        section === "products"
          ? "public, max-age=300, must-revalidate"
          : undefined,
    });

    return { pathname: asset.pathname };
  } catch (error) {
    console.error("[uploadMediaImageAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error subiendo la imagen",
    );
  }
}
