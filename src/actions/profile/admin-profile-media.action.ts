"use server";

import { auth } from "@/auth";
import { uploadBlob, deleteBlob } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { MEDIA_SECTION_CONFIG } from "@/models/media.models";
import { AvatarSchema, AvatarTypeSchema, AvatarUpdateSchema } from "@/schemas";
import { toBlobPath, toBlobUrl } from "@/utils/blob-path";
import sharp from "sharp";

const AvatarMetadataSchema = AvatarSchema.omit({ imageUrl: true });

type ProfileMediaType = "AVATAR" | "BANNER";

type ProfileMediaItem = {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  availability: string | null;
  price: number | null;
  type: ProfileMediaType;
};

const resolveProfileSection = (type: ProfileMediaType) =>
  type === "AVATAR" ? "profile-avatars" : "profile-banners";

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
    throw new Error("Solo se permiten imágenes");
  }

  const parsed = AvatarMetadataSchema.parse({
    name: formData.get("name"),
    rarity: formData.get("rarity"),
    availability: formData.get("availability"),
    price: formData.get("price"),
    type: formData.get("type"),
  });

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

  const blob = await uploadBlob({
    path,
    buffer: outputBuffer,
    contentType: "image/webp",
  });

  const created = await prisma.avatar.create({
    data: {
      name: parsed.name,
      imageUrl: blob.pathname,
      rarity: parsed.rarity,
      availability: parsed.availability,
      price: parsed.price,
      type: parsed.type as ProfileMediaType,
    },
    select: pickProfileMediaSelect,
  });

  return created as ProfileMediaItem;
};

export const updateProfileMediaAction = async (input: unknown) => {
  await ensureAdmin();

  const parsed = AvatarUpdateSchema.parse(input);

  const updated = await prisma.avatar.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      rarity: parsed.rarity,
      availability: parsed.availability,
      price: parsed.price,
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

  const pathname = toBlobPath(avatar.imageUrl);
  const fullUrl = toBlobUrl(avatar.imageUrl);
  const candidates = [avatar.imageUrl, pathname, fullUrl].filter(Boolean);

  // Evitamos borrar recursos que siguen ligados a usuarios o inventarios.
  const usedByUser = await prisma.user.findFirst({
    where: {
      OR: [{ image: { in: candidates } }, { bannerImage: { in: candidates } }],
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

  await deleteBlob(avatar.imageUrl);
  await prisma.avatar.delete({ where: { id: avatar.id } });

  return { ok: true };
};
