"use server";

import { auth } from "@/auth";
import { listBlob } from "@/lib/blob";

export async function getProductImagesAction(): Promise<string[]> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return [];
    }

    const list = await listBlob("souls/products/");
    return list
      .sort((a, b) => a.pathname.localeCompare(b.pathname))
      .map((item) => item.pathname);
  } catch (error) {
    console.error("[getProductImagesAction]", error);
    throw new Error("Error cargando las imágenes del producto");
  }
}
