"use server";

import { auth } from "@/auth";
import { uploadAsset, deleteAsset } from "@/lib/assets-storage";
import { prisma } from "@/lib/prisma";
import { MEDIA_SECTION_CONFIG } from "@/models/media.models";
import { AvatarSchema, AvatarTypeSchema, AvatarUpdateSchema } from "@/schemas";
import { toAssetPath, toAssetStorageUrl } from "@/utils/asset-path";
import { Prisma } from "@prisma/client";
import sharp from "sharp";

const AvatarMetadataSchema = AvatarSchema.omit({ imageUrl: true });

const getValidationMessage = (issues: { message?: string }[]) =>
  issues.find((issue) => issue.message)?.message ?? "Datos invalidos.";

type ProfileMediaType = "AVATAR" | "BANNER" | "FRAME";

type ProfileMediaItem = {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  availability: string | null;
  price: number | null;
  type: ProfileMediaType;
  storeVisible: boolean;
  isSeasonal: boolean;
  seasonNumber: number | null;
  seasonEndsAt: Date | null;
  featured: boolean;
  featuredOrder: number;
};

const resolveProfileSection = (type: ProfileMediaType) =>
  type === "AVATAR"
    ? "profile-avatars"
    : type === "BANNER"
      ? "profile-banners"
      : "profile-frames";

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

const ensureAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }
};

const pickProfileMediaSelect = {
  id: true,
  name: true,
  imageUrl: true,
  rarity: true,
  availability: true,
  price: true,
  type: true,
  storeVisible: true,
  isSeasonal: true,
  seasonNumber: true,
  seasonEndsAt: true,
  featured: true,
  featuredOrder: true,
} as const;

export const getAdminProfileMediaAction = async (type: string) => {
  await ensureAdmin();
  const parsedType = AvatarTypeSchema.parse(type) as ProfileMediaType;

  return prisma.avatar.findMany({
    where: { type: parsedType },
    select: pickProfileMediaSelect,
    orderBy: { name: "asc" },
  });
};

export const createProfileMediaAction = async (formData: FormData) => {
  await ensureAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Archivo invalido");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten imÃ¡genes");
  }

  const parsedResult = AvatarMetadataSchema.safeParse({
    name: formData.get("name"),
    rarity: formData.get("rarity"),
    availability: formData.get("availability"),
    price: formData.get("price"),
    type: formData.get("type"),
    storeVisible: formData.get("storeVisible"),
    isSeasonal: formData.get("isSeasonal"),
    seasonNumber: formData.get("seasonNumber"),
    seasonEndsAt: formData.get("seasonEndsAt"),
    featured: formData.get("featured"),
    featuredOrder: formData.get("featuredOrder"),
  });

  if (!parsedResult.success) {
    throw new Error(getValidationMessage(parsedResult.error.issues));
  }

  const parsed = parsedResult.data;

  const sectionKey = resolveProfileSection(parsed.type as ProfileMediaType);
  const config = MEDIA_SECTION_CONFIG[sectionKey];
  const maxBytes = config.maxSizeMb * 1024 * 1024;

  if (!config.allowUpload) {
    throw new Error("Esta seccion no admite cargas por ahora");
  }

  if (file.size > maxBytes) {
    throw new Error(`La imagen supera el limite de ${config.maxSizeMb}MB`);
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  // Convertimos siempre a WebP para estandarizar peso y formato.
  const outputBuffer = await sharp(inputBuffer)
    .webp({ quality: 85 })
    .toBuffer();

  const safeName = buildSafeName(parsed.name || file.name);
  const filename = `${safeName}-${crypto.randomUUID()}.webp`;
  const path = `${config.folder}/${filename}`;

  const asset = await uploadAsset({
    path,
    buffer: outputBuffer,
    contentType: "image/webp",
  });

  const created = await prisma.avatar.create({
    data: {
      name: parsed.name,
      imageUrl: asset.pathname,
      rarity: parsed.rarity,
      availability: parsed.availability,
      price: parsed.price,
      type: parsed.type as ProfileMediaType,
      storeVisible: parsed.storeVisible,
      isSeasonal: parsed.isSeasonal,
      seasonNumber: parsed.isSeasonal ? parsed.seasonNumber : null,
      seasonEndsAt: parsed.isSeasonal ? parsed.seasonEndsAt : null,
      featured: parsed.featured,
      featuredOrder: parsed.featuredOrder,
    },
    select: pickProfileMediaSelect,
  });

  return created as ProfileMediaItem;
};

export const updateProfileMediaAction = async (input: unknown) => {
  await ensureAdmin();

  const parsedResult = AvatarUpdateSchema.safeParse(input);
  if (!parsedResult.success) {
    throw new Error(getValidationMessage(parsedResult.error.issues));
  }

  const parsed = parsedResult.data;

  const updated = await prisma.avatar.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      rarity: parsed.rarity,
      availability: parsed.availability,
      price: parsed.price,
      storeVisible: parsed.storeVisible,
      isSeasonal: parsed.isSeasonal,
      seasonNumber: parsed.isSeasonal ? parsed.seasonNumber : null,
      seasonEndsAt: parsed.isSeasonal ? parsed.seasonEndsAt : null,
      featured: parsed.featured,
      featuredOrder: parsed.featuredOrder,
    },
    select: pickProfileMediaSelect,
  });

  return updated as ProfileMediaItem;
};

export const deleteProfileMediaAction = async (avatarId: string) => {
  await ensureAdmin();

  if (!avatarId) {
    throw new Error("No se pudo identificar el avatar");
  }

  const avatar = await prisma.avatar.findUnique({
    where: { id: avatarId },
    select: {
      id: true,
      imageUrl: true,
    },
  });

  if (!avatar) {
    throw new Error("El avatar ya no existe");
  }

  const pathname = toAssetPath(avatar.imageUrl);
  const fullUrl = toAssetStorageUrl(avatar.imageUrl);
  const candidates = [avatar.imageUrl, pathname, fullUrl].filter(Boolean);

  // Evitamos borrar recursos que siguen ligados a usuarios o inventarios.
  const usedByUser = await prisma.user.findFirst({
    where: {
      OR: [
        { image: { in: candidates } },
        { bannerImage: { in: candidates } },
        { frameImage: { in: candidates } },
      ],
    },
    select: { id: true },
  });

  if (usedByUser) {
    throw new Error("La imagen esta en uso y no se puede eliminar");
  }

  const usedByInventory = await prisma.userAvatar.findFirst({
    where: { avatarId: avatar.id },
    select: { id: true },
  });

  if (usedByInventory) {
    throw new Error("La imagen esta en uso y no se puede eliminar");
  }

  const usedByPurchase = await prisma.avatarPurchase.findFirst({
    where: { avatarId: avatar.id },
    select: { id: true },
  });

  if (usedByPurchase) {
    throw new Error(
      "La imagen esta asociada a compras de usuarios y no se puede eliminar",
    );
  }

  try {
    await prisma.avatar.delete({ where: { id: avatar.id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2014" || error.code === "P2003")
    ) {
      throw new Error("La imagen esta en uso y no se puede eliminar");
    }

    console.error("[deleteProfileMediaAction]", error);
    throw new Error("No se pudo eliminar la imagen");
  }

  await deleteAsset(avatar.imageUrl);

  return { ok: true };
};
