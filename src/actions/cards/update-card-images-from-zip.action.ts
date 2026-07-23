"use server";

import { basename, extname } from "path";
import JSZip from "jszip";
import sharp from "sharp";
import { auth } from "@/auth";
import { assetExists, copyAsset, deleteAsset, uploadAsset } from "@/lib/assets-storage";
import { prisma } from "@/lib/prisma";
import { CardImagesBulkUpdateSchema } from "@/schemas";
import { buildCardImageKey } from "@/utils/card-image";

const ACCEPTED_IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
]);
const MAX_IMAGE_SIZE_MB = 6;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

type ParsedZipImage = {
  baseName: string;
  fileName: string;
  buffer: Buffer;
};

type CardImageTarget = {
  id: string;
  code: string;
  idd: string;
  name: string;
  imageKey: string;
  previousImageUrl: string | null;
};

type PreparedImage = {
  target: CardImageTarget;
  fileName: string;
  outputBuffer: Buffer;
};

export type UpdateCardImagesFromZipResult = {
  status: "success" | "conflict";
  message: string;
  summary: {
    imagesRead: number;
    matchedImages: number;
    updatedImages: number;
    backupsCreated: number;
  };
  imageErrors: string[];
  updatedCards: Array<{
    code: string;
    idd: string;
    name: string;
    imageKey: string;
    imageUrl: string;
  }>;
};

const isSystemZipEntry = (entryName: string) => {
  const normalized = entryName.replace(/\\/g, "/");
  const name = basename(normalized);
  return (
    normalized.startsWith("__MACOSX/") ||
    name === ".DS_Store" ||
    name.startsWith("._")
  );
};

const getZipEntryUncompressedSize = (file: JSZip.JSZipObject) =>
  (file as { _data?: { uncompressedSize?: number } })._data
    ?.uncompressedSize ?? null;

const parseImagesZip = async (zipFile: File) => {
  const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
  const zip = await JSZip.loadAsync(zipBuffer);
  const imagesByBaseName = new Map<string, ParsedZipImage>();
  const errors: string[] = [];
  let imagesRead = 0;

  for (const file of Object.values(zip.files)) {
    const normalizedEntryName = file.name.replace(/\\/g, "/");
    if (file.dir || isSystemZipEntry(normalizedEntryName)) continue;

    const fileName = basename(normalizedEntryName);
    const extension = extname(fileName).toLowerCase();
    if (!ACCEPTED_IMAGE_EXTENSIONS.has(extension)) {
      errors.push(`Archivo no permitido en ZIP: ${normalizedEntryName}`);
      continue;
    }

    imagesRead += 1;
    const baseName = fileName.slice(0, fileName.length - extension.length);
    if (!baseName) {
      errors.push(`Nombre de imagen invalido: ${fileName}`);
      continue;
    }

    if (imagesByBaseName.has(baseName)) {
      errors.push(`Imagen duplicada para ${baseName}.`);
      continue;
    }

    const declaredSize = getZipEntryUncompressedSize(file);
    if (declaredSize !== null && declaredSize > MAX_IMAGE_SIZE_BYTES) {
      errors.push(
        `${fileName} supera el limite de ${MAX_IMAGE_SIZE_MB}MB por imagen.`,
      );
      continue;
    }

    const buffer = await file.async("nodebuffer");
    if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
      errors.push(
        `${fileName} supera el limite de ${MAX_IMAGE_SIZE_MB}MB por imagen.`,
      );
      continue;
    }

    imagesByBaseName.set(baseName, {
      baseName,
      fileName,
      buffer,
    });
  }

  return {
    imagesRead,
    imagesByBaseName,
    errors,
  };
};

const buildCardImageTargetLookup = async () => {
  const cards = await prisma.card.findMany({
    where: {
      OR: [{ status: "active" }, { status: { isSet: false } }],
    },
    select: {
      id: true,
      code: true,
      idd: true,
      name: true,
      imageUrl: true,
    },
  });

  return new Map(
    cards.map((card) => [
      `${card.code}-${card.idd}`,
      {
        id: card.id,
        code: card.code,
        idd: card.idd,
        name: card.name,
        imageKey: buildCardImageKey(card.code, card.idd),
        previousImageUrl: card.imageUrl,
      },
    ]),
  );
};

const conflictResult = ({
  message,
  imagesRead,
  matchedImages = 0,
  imageErrors,
}: {
  message: string;
  imagesRead: number;
  matchedImages?: number;
  imageErrors: string[];
}): UpdateCardImagesFromZipResult => ({
  status: "conflict",
  message,
  summary: {
    imagesRead,
    matchedImages,
    updatedImages: 0,
    backupsCreated: 0,
  },
  imageErrors,
  updatedCards: [],
});

export async function updateCardImagesFromZipAction(
  formData: FormData,
): Promise<UpdateCardImagesFromZipResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }

  const parsedInput = CardImagesBulkUpdateSchema.safeParse({
    imagesZip: formData.get("imagesZip"),
  });

  if (!parsedInput.success) {
    throw new Error(
      parsedInput.error.errors[0]?.message ?? "ZIP de entrada invalido.",
    );
  }

  const parsedZip = await parseImagesZip(parsedInput.data.imagesZip);
  if (parsedZip.imagesRead === 0) {
    return conflictResult({
      message: "No se encontraron imagenes validas para actualizar.",
      imagesRead: 0,
      imageErrors: parsedZip.errors,
    });
  }

  if (parsedZip.errors.length > 0) {
    return conflictResult({
      message: "Actualizacion detenida: corrige el ZIP de imagenes.",
      imagesRead: parsedZip.imagesRead,
      imageErrors: parsedZip.errors,
    });
  }

  const targetLookup = await buildCardImageTargetLookup();
  const targets: Array<{ image: ParsedZipImage; target: CardImageTarget }> = [];
  const imageErrors: string[] = [];

  parsedZip.imagesByBaseName.forEach((image, baseName) => {
    const target = targetLookup.get(baseName);
    if (!target) {
      imageErrors.push(`No existe carta para la imagen: ${image.fileName}`);
      return;
    }
    targets.push({ image, target });
  });

  if (imageErrors.length > 0) {
    return conflictResult({
      message: "Actualizacion detenida: hay imagenes sin carta asociada.",
      imagesRead: parsedZip.imagesRead,
      matchedImages: targets.length,
      imageErrors,
    });
  }

  const missingCurrentImages: string[] = [];
  for (const item of targets) {
    const exists = await assetExists(item.target.imageKey);
    if (!exists) {
      missingCurrentImages.push(
        `No existe imagen actual en R2 para ${item.target.code}: ${item.target.imageKey}`,
      );
    }
  }

  if (missingCurrentImages.length > 0) {
    return conflictResult({
      message:
        "Actualizacion detenida: todas las cartas deben tener imagen actual en R2 para poder respaldar.",
      imagesRead: parsedZip.imagesRead,
      matchedImages: targets.length,
      imageErrors: missingCurrentImages,
    });
  }

  const preparedImages: PreparedImage[] = [];
  for (const item of targets) {
    try {
      const outputBuffer = await sharp(item.image.buffer)
        .webp({ quality: 88 })
        .toBuffer();

      preparedImages.push({
        target: item.target,
        fileName: item.image.fileName,
        outputBuffer,
      });
    } catch {
      return conflictResult({
        message: "Actualizacion detenida: hay imagenes invalidas.",
        imagesRead: parsedZip.imagesRead,
        matchedImages: targets.length,
        imageErrors: [`${item.image.fileName} no es una imagen valida.`],
      });
    }
  }

  const backupPrefix = `backups/cards/bulk-update-${Date.now()}-${crypto.randomUUID()}`;
  const backups: Array<{ sourceKey: string; backupKey: string }> = [];
  const uploadedKeys: string[] = [];
  const imageVersion = Date.now();

  try {
    for (const image of preparedImages) {
      const fileName = basename(image.target.imageKey);
      const backupKey = `${backupPrefix}/${fileName}`;
      await copyAsset(image.target.imageKey, backupKey);
      backups.push({
        sourceKey: image.target.imageKey,
        backupKey,
      });
    }

    for (const image of preparedImages) {
      await uploadAsset({
        path: image.target.imageKey,
        buffer: image.outputBuffer,
        contentType: "image/webp",
      });
      uploadedKeys.push(image.target.imageKey);
    }

    await prisma.$transaction(
      preparedImages.map((image) =>
        prisma.card.update({
          where: { id: image.target.id },
          data: {
            imageUrl: `${image.target.imageKey}?v=${imageVersion}`,
          },
        }),
      ),
    );
  } catch (error) {
    const restoreResults = await Promise.allSettled(
      backups.map((backup) => copyAsset(backup.backupKey, backup.sourceKey)),
    );
    await Promise.allSettled(
      preparedImages.map((image) =>
        prisma.card.update({
          where: { id: image.target.id },
          data: { imageUrl: image.target.previousImageUrl },
        }),
      ),
    );
    await Promise.allSettled(
      backups.map((backup) => deleteAsset(backup.backupKey)),
    );

    const restoreFailed = restoreResults.some(
      (result) => result.status === "rejected",
    );

    if (restoreFailed) {
      throw new Error(
        "No se pudo completar la actualizacion y alguna imagen no pudo restaurarse desde backup. Revisa R2 antes de reintentar.",
      );
    }

    throw new Error(
      error instanceof Error
        ? `No se pudo completar la actualizacion. Se restauraron las imagenes desde backup. Detalle: ${error.message}`
        : "No se pudo completar la actualizacion. Se restauraron las imagenes desde backup.",
    );
  }

  await Promise.allSettled(backups.map((backup) => deleteAsset(backup.backupKey)));

  return {
    status: "success",
    message: "Imagenes de cartas actualizadas correctamente.",
    summary: {
      imagesRead: parsedZip.imagesRead,
      matchedImages: preparedImages.length,
      updatedImages: uploadedKeys.length,
      backupsCreated: backups.length,
    },
    imageErrors: [],
    updatedCards: preparedImages.map((image) => ({
      code: image.target.code,
      idd: image.target.idd,
      name: image.target.name,
      imageKey: image.target.imageKey,
      imageUrl: `${image.target.imageKey}?v=${imageVersion}`,
    })),
  };
}
