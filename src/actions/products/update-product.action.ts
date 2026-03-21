"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UpdateProductSchema, type UpdateProductInput } from "@/schemas";

export async function updateProductAction(input: UpdateProductInput) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const data = UpdateProductSchema.parse(input);

    const [product, existingCode, existingUrl, deck] = await Promise.all([
      prisma.product.findUnique({
        where: { id: data.productId },
        select: { id: true, code: true, status: true },
      }),
      prisma.product.findFirst({
        where: {
          code: data.code,
          NOT: { id: data.productId },
          OR: [{ status: "active" }, { status: { isSet: false } }],
        },
        select: { id: true },
      }),
      prisma.product.findFirst({
        where: {
          url: data.url,
          NOT: { id: data.productId },
          OR: [{ status: "active" }, { status: { isSet: false } }],
        },
        select: { id: true },
      }),
      prisma.deck.findUnique({
        where: { id: data.deckId },
        select: { id: true, isAdminDeck: true, cardsNumber: true },
      }),
    ]);

    if (!product) {
      throw new Error("Producto no encontrado");
    }
    if (product.status === "deleted") {
      throw new Error("El producto ya no está disponible");
    }

    if (existingCode) {
      throw new Error("El código del producto ya está en uso");
    }

    if (existingUrl) {
      throw new Error("La URL del producto ya está en uso");
    }

    if (!deck?.isAdminDeck) {
      throw new Error("El mazo seleccionado no es válido");
    }

    // Usa el total de cartas del mazo admin para mantener el conteo sincronizado.
    const numberCards = deck.cardsNumber ?? data.numberCards;

    await prisma.product.update({
      where: { id: data.productId },
      data: {
        name: data.name,
        code: data.code,
        index: data.index,
        releaseDate: data.releaseDate,
        description: data.description,
        url: data.url,
        show: data.show,
        deckId: data.deckId,
        numberCards,
        ProductImage: {
          deleteMany: {},
          create: {
            url: data.imageUrl,
            alt: data.name,
          },
        },
      },
    });
  } catch (error) {
    console.error("[updateProductAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error actualizando producto",
    );
  }
}
