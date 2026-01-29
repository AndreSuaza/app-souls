"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "next-auth";
import { SaveDeckSchema, type SaveDeckInput } from "@/schemas";

export async function saveDeck(input: SaveDeckInput) {
  const session = await auth();

  try {
    const data = SaveDeckSchema.parse(input);

    if (!session) {
      return {
        success: false,
        message:
          "No tienes una sesi\u00f3n activa. Por favor, inicia sesi\u00f3n para continuar",
      };
    }

    if (!session.user.idd) {
      return {
        success: false,
        message:
          "Error en la sesi\u00f3n activa. Por favor, vuelva a iniciar sesi\u00f3n para continuar",
      };
    }

    if (data.visible && data.cardsNumber < 40) {
      return {
        success: false,
        message:
          "Para publicar un mazo debe tener 40 cartas en el mazo principal.",
      };
    }

    if (data.deckId) {
      const existingDeck = await prisma.deck.findUnique({
        where: { id: data.deckId },
        select: { id: true, userId: true },
      });

      if (existingDeck && existingDeck.userId === session.user.idd) {
        await prisma.deck.update({
          where: { id: existingDeck.id },
          data: {
            name: data.name,
            description: data.description,
            archetypeId: data.archetypesId,
            imagen: data.imgDeck,
            cards: data.deckList,
            visible: data.visible,
            cardsNumber: data.cardsNumber,
          },
        });
        return { success: true };
      }
    }

    // verificar si existe el usuario en la base de datos
    const decksNumber = await prisma.deck.count({
      where: {
        userId: session.user.idd,
      },
    });

    if (decksNumber < 12) {
      await prisma.deck.create({
        data: {
          userId: session.user.idd,
          name: data.name,
          description: data.description,
          archetypeId: data.archetypesId,
          imagen: data.imgDeck,
          cards: data.deckList,
          visible: data.visible,
          cardsNumber: data.cardsNumber,
        },
      });
      return { success: true };
    }

    return { success: false, message: "L\u00edmite de 12 mazos alcanzado" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }
    return { error: "error 500" };
  }
}
