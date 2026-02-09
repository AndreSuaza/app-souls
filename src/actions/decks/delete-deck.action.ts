"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DeleteDeckSchema, type DeleteDeckInput } from "@/schemas";

const MAX_TOURNAMENT_DECK_EDIT_DAYS = 7;

export async function deleteDeckAction(input: DeleteDeckInput) {
  const session = await auth();

  if (!session?.user?.idd) {
    throw new Error("No tienes una sesión activa.");
  }

  const parsed = DeleteDeckSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  const { deckId } = parsed.data;

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId: session.user.idd,
    },
    select: {
      id: true,
      tournamentId: true,
      createdAt: true,
    },
  });

  if (!deck) {
    throw new Error("No se encontró el mazo.");
  }

  if (deck.tournamentId) {
    const tournamentPlayer = await prisma.tournamentPlayer.findFirst({
      where: {
        deckId: deck.id,
        userId: session.user.idd,
      },
      select: {
        id: true,
        deckAssignedAt: true,
      },
    });

    const lockStart = tournamentPlayer?.deckAssignedAt ?? deck.createdAt;
    const deadline = new Date(lockStart);
    deadline.setDate(deadline.getDate() + MAX_TOURNAMENT_DECK_EDIT_DAYS);

    // Bloquea la eliminación si ya pasó la ventana permitida del torneo.
    if (new Date() > deadline) {
      throw new Error(
        "Ya no puedes eliminar este mazo porque superaste el tiempo permitido.",
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.tournamentPlayer.updateMany({
        where: {
          deckId: deck.id,
          userId: session.user.idd,
        },
        data: {
          deckId: null,
        },
      });
      // Limpia likes asociados para evitar violar la relacion requerida.
      await tx.like.deleteMany({
        where: { deckId: deck.id },
      });
      await tx.deck.delete({
        where: { id: deck.id },
      });
    });

    return { success: true };
  }

  await prisma.$transaction(async (tx) => {
    // Limpia likes asociados para evitar violar la relacion requerida.
    await tx.like.deleteMany({
      where: { deckId: deck.id },
    });
    await tx.deck.delete({
      where: { id: deck.id },
    });
  });

  return { success: true };
}
