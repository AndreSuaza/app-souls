"use server";

import { auth } from "@/auth";
import { deleteBlob } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { MEDIA_SECTION_CONFIG } from "@/models/media.models";
import { MediaSectionSchema } from "@/schemas";
import { toBlobPath, toBlobUrl } from "@/utils/blob-path";

const validateUsage = async (section: string, url: string) => {
  const pathname = toBlobPath(url);
  const fullUrl = toBlobUrl(url);
  const candidates = [url, pathname, fullUrl].filter(Boolean);

  if (section === "news-banners") {
    const used = await prisma.new.findFirst({
      where: {
        featuredImage: {
          in: candidates,
        },
      },
      select: { id: true },
    });
    return Boolean(used);
  }

  if (section === "news-cards") {
    const used = await prisma.new.findFirst({
      where: {
        cardImage: {
          in: candidates,
        },
      },
      select: { id: true },
    });
    return Boolean(used);
  }

  if (section === "products") {
    const used = await prisma.productImage.findFirst({
      where: {
        url: {
          in: candidates,
        },
      },
      select: { id: true },
    });
    return Boolean(used);
  }

  return false;
};

export async function deleteMediaImageAction(section: string, url: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const parsedSection = MediaSectionSchema.parse(section);
    const config = MEDIA_SECTION_CONFIG[parsedSection];

    if (!config.allowDelete) {
      throw new Error("Esta sección no admite eliminaciones por ahora");
    }

    if (!url) {
      throw new Error("No se pudo identificar la imagen");
    }

    const isUsed = await validateUsage(parsedSection, url);

    if (isUsed) {
      throw new Error("La imagen está en uso y no se puede eliminar");
    }

    await deleteBlob(url);
    return { ok: true };
  } catch (error) {
    console.error("[deleteMediaImageAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error eliminando la imagen",
    );
  }
}
