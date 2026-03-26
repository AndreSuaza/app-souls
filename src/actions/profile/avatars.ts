"use server";

import { auth } from "@/auth";
import { listBlob } from "@/lib/blob";
import { MEDIA_SECTION_CONFIG } from "@/models/media.models";

const sortPathnames = (items: { pathname: string; url: string }[]) =>
  items
    .sort((a, b) => a.pathname.localeCompare(b.pathname))
    .map((item) => item.pathname);

export const getAvatars = async () => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("No autorizado");
    }
    const config = MEDIA_SECTION_CONFIG["profile-avatars"];
    const prefix = `${config.folder}/`;
    const list = await listBlob(prefix);
    return sortPathnames(list);
  } catch (error) {
    throw new Error(`No se pudo cargar los avatares ${error}`);
  }
};

export const getProfileBanners = async () => {
  try {
    const session = await auth();
    if (!session?.user) {
      throw new Error("No autorizado");
    }
    const config = MEDIA_SECTION_CONFIG["profile-banners"];
    const prefix = `${config.folder}/`;
    const list = await listBlob(prefix);
    return sortPathnames(list);
  } catch (error) {
    throw new Error(`No se pudo cargar los banners ${error}`);
  }
};
