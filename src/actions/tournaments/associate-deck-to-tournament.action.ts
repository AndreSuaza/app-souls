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
    throw new Error("No tienes una sesión activa.");
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
      tournament: {
        select: {
          status: true,
          finishedAt: true,
          typeTournament: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!tournamentPlayer) {
    throw new Error("No estas registrado en este torneo.");
  }

  const tournamentTypeName =
    tournamentPlayer.tournament.typeTournament?.name ?? "";
  const isCompetitiveTier = ["Tier 1", "Tier 2"].includes(tournamentTypeName);
  const tournamentStatus = tournamentPlayer.tournament.status;
  const tournamentFinishedAt = tournamentPlayer.tournament.finishedAt;
  const now = new Date();

  if (isCompetitiveTier) {
    if (tournamentStatus !== "pending" && tournamentStatus !== "in_progress") {
      throw new Error(
        "Solo puedes asociar un mazo antes o durante el torneo.",
      );
    }
  } else {
    const canAssociateBeforeFinish =
      tournamentStatus === "pending" || tournamentStatus === "in_progress";
    const canAssociateAfterFinish =
      tournamentStatus === "finished" &&
      tournamentFinishedAt instanceof Date &&
      (() => {
        // Respeta la ventana de 7 días después de finalizar en Tier 3.
        const deadline = new Date(tournamentFinishedAt);
        deadline.setDate(deadline.getDate() + MAX_DECK_ASSOCIATION_DAYS);
        return now <= deadline;
      })();

    if (!canAssociateBeforeFinish && !canAssociateAfterFinish) {
      throw new Error(
        "Solo puedes asociar un mazo antes, durante o hasta 7 días después de finalizar el torneo.",
      );
    }
  }

  if (tournamentPlayer.deckId) {
    throw new Error("Ya tienes un mazo asociado a este torneo.");
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
    throw new Error("No se encontró el mazo seleccionado.");
  }

  if (deck.cardsNumber < 40) {
    throw new Error(
      "El mazo debe tener al menos 40 cartas en el mazo principal para asociarse.",
    );
  }


  // Duplica el mazo y asegura la asociación en una misma transacción.
  const duplicatedDeck = await prisma.$transaction(async (tx) => {
    if (deck.visible && tournamentStatus !== "finished") {
      // Protege la privacidad del mazo original mientras el torneo no termina.
      await tx.deck.update({
        where: { id: deck.id },
        data: { visible: false },
      });
    }

    const created = await tx.deck.create({
      data: {
        userId,
        name: deck.name,
        description: deck.description,
        imagen: deck.imagen,
        cards: deck.cards,
        cardsNumber: deck.cardsNumber,
        // Los mazos de torneo son privados hasta finalizar.
        visible: tournamentStatus === "finished",
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
      },
    });

    return created;
  });

  return {
    deckId: duplicatedDeck.id,
  };
}
