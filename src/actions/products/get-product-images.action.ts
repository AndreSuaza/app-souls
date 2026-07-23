"use server";

import { auth } from "@/auth";
import { listAssets } from "@/lib/assets-storage";

const PRODUCT_IMAGES_PREFIX = "products/";
const IMAGE_EXTENSION_PATTERN = /\.(webp|png|jpe?g|avif)$/i;

const isDirectProductImage = (pathname: string) => {
  if (!pathname.startsWith(PRODUCT_IMAGES_PREFIX)) return false;
  const relativePath = pathname.slice(PRODUCT_IMAGES_PREFIX.length);
  return (
    relativePath.length > 0 &&
    !relativePath.includes("/") &&
    IMAGE_EXTENSION_PATTERN.test(relativePath)
  );
};

export async function getProductImagesAction(): Promise<string[]> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return [];
    }

    const list = await listAssets(PRODUCT_IMAGES_PREFIX);
    return list
      .filter((item) => isDirectProductImage(item.pathname))
      .sort((a, b) => a.pathname.localeCompare(b.pathname))
      .map((item) => item.pathname);
  } catch (error) {
    console.error("[getProductImagesAction]", error);
    throw new Error("Error cargando las imágenes del producto");
  }
}
