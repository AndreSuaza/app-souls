"use server";

import { listBlob } from "@/lib/blob";
import { CardImagesSchema, type CardImagesInput } from "@/schemas";

export async function getCardImagesAction(input: CardImagesInput = {}) {
  CardImagesSchema.parse(input);

  const files = await listBlob("cards/");

  return files
    .map((file) => file.pathname.replace(/^cards\//, ""))
    .filter((file) => file.toLowerCase().endsWith(".webp"))
    .sort((a, b) => a.localeCompare(b));
}
