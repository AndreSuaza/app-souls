"use server";

import { auth } from "@/auth";
import { listBlob } from "@/lib/blob";
import { MEDIA_SECTION_CONFIG } from "@/models/media.models";
import { MediaSectionSchema } from "@/schemas";

const mapToUrls = (items: { pathname: string; url: string }[]) =>
  items
    .sort((a, b) => a.pathname.localeCompare(b.pathname))
    .map((item) => item.url);

export async function getMediaImagesAction(section: string): Promise<string[]> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const parsedSection = MediaSectionSchema.parse(section);
    const config = MEDIA_SECTION_CONFIG[parsedSection];
    const prefix = `${config.folder}/`;

    const list = await listBlob(prefix);
    return mapToUrls(list);
  } catch (error) {
    console.error("[getMediaImagesAction]", error);
    throw new Error("Error cargando las imágenes");
  }
}
