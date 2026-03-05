"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateProductSchema, type CreateProductInput } from "@/schemas";

export async function createProductAction(input: CreateProductInput) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const data = CreateProductSchema.parse(input);

    const [existingCode, existingUrl, deck, lastProduct] = await Promise.all([
      prisma.product.findFirst({
        where: {
          code: data.code,
          OR: [{ status: "active" }, { status: { isSet: false } }],
        },
        select: { id: true },
      }),
      prisma.product.findFirst({
        where: {
          url: data.url,
          OR: [{ status: "active" }, { status: { isSet: false } }],
        },
        select: { id: true },
      }),
      prisma.deck.findUnique({
        where: { id: data.deckId },
        select: { id: true, isAdminDeck: true, cardsNumber: true },
      }),
      prisma.product.findFirst({
        orderBy: { index: "desc" },
        select: { index: true },
      }),
    ]);

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
    // El índice es autoincremental y se calcula con base en el último registro.
    const nextIndex = (lastProduct?.index ?? 0) + 1;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        code: data.code,
        index: nextIndex,
        releaseDate: data.releaseDate,
        description: data.description,
        url: data.url,
        show: data.show,
        deckId: data.deckId,
        numberCards,
        status: "active",
        ProductImage: {
          create: {
            url: data.code,
            alt: data.name,
          },
        },
      },
      select: {
        id: true,
      },
    });

    return product.id;
  } catch (error) {
    console.error("[createProductAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error creando producto",
    );
  }
}
