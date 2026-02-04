"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  AssociateTournamentDeckSchema,
  type AssociateTournamentDeckInput,
} from "@/schemas";

const MAX_DECK_ASSOCIATION_DAYS = 7;

export async function associateDeckToTournamentAction(
  input: AssociateTournamentDeckInput,
) {
  const session = await auth();

  const userId = session?.user?.idd;
  if (!userId) {
    throw new Error("No tienes una sesi\u00f3n activa.");
  }

  const parsed = AssociateTournamentDeckSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  const { tournamentId, deckId } = parsed.data;

  const tournamentPlayer = await prisma.tournamentPlayer.findFirst({
    where: {
      tournamentId,
      userId: session.user.idd,
    },
    select: {
      id: true,
      deckId: true,
      deckAssignedAt: true,
      tournament: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!tournamentPlayer) {
    throw new Error("No estas registrado en este torneo.");
  }

  if (tournamentPlayer.tournament.status !== "finished") {
    throw new Error(
      "Solo puedes asociar un mazo cuando el torneo ha finalizado.",
    );
  }

  if (tournamentPlayer.deckId) {
    throw new Error("Ya tienes un mazo asociado a este torneo.");
  }

  if (tournamentPlayer.deckAssignedAt) {
    const deadline = new Date(tournamentPlayer.deckAssignedAt);
    deadline.setDate(deadline.getDate() + MAX_DECK_ASSOCIATION_DAYS);
    if (new Date() > deadline) {
      throw new Error(
        "Ya superaste el tiempo permitido para asociar un mazo a este torneo.",
      );
    }
  }

  const deck = await prisma.deck.findFirst({
    where: {
      id: deckId,
      userId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      imagen: true,
      cards: true,
      cardsNumber: true,
      visible: true,
      archetypeId: true,
    },
  });

  if (!deck) {
    throw new Error("No se encontr\u00f3 el mazo seleccionado.");
  }

  if (deck.cardsNumber < 40) {
    throw new Error(
      "El mazo debe tener al menos 40 cartas en el mazo principal para asociarse.",
    );
  }

  const now = new Date();

  // Duplica el mazo y asegura la asociación en una misma transacción.
  const duplicatedDeck = await prisma.$transaction(async (tx) => {
    const created = await tx.deck.create({
      data: {
        userId,
        name: deck.name,
        description: deck.description,
        imagen: deck.imagen,
        cards: deck.cards,
        cardsNumber: deck.cardsNumber,
        visible: deck.visible,
        archetypeId: deck.archetypeId,
        tournamentId,
      },
      select: {
        id: true,
      },
    });

    await tx.tournamentPlayer.update({
      where: { id: tournamentPlayer.id },
      data: {
        deckId: created.id,
        deckAssignedAt: tournamentPlayer.deckAssignedAt ?? now,
      },
    });

    return created;
  });

  return {
    deckId: duplicatedDeck.id,
    deckAssignedAt: (tournamentPlayer.deckAssignedAt ?? now).toISOString(),
  };
}
