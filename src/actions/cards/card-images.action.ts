"use server";

import { readdir } from "node:fs/promises";
import path from "node:path";
import { CardImagesSchema, type CardImagesInput } from "@/schemas";

export async function getCardImagesAction(input: CardImagesInput = {}) {
  CardImagesSchema.parse(input);

  const directory = path.join(process.cwd(), "public", "cards");
  const files = await readdir(directory);

  return files
    .filter((file) => file.toLowerCase().endsWith(".webp"))
    .sort((a, b) => a.localeCompare(b));
}
