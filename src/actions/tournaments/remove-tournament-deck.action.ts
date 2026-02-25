"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  RemoveTournamentDeckSchema,
  type RemoveTournamentDeckInput,
} from "@/schemas";

export async function removeTournamentDeckAction(
  input: RemoveTournamentDeckInput,
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("No autorizado.");
  }

  if (session.user.role !== "admin" && session.user.role !== "store") {
    throw new Error("No autorizado.");
  }

  const parsed = RemoveTournamentDeckSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Datos invalidos.");
  }

  const { tournamentId, tournamentPlayerId } = parsed.data;

  const tournamentPlayer = await prisma.tournamentPlayer.findFirst({
    where: {
      id: tournamentPlayerId,
      tournamentId,
    },
    select: {
      id: true,
      deckId: true,
      tournament: {
        select: {
          status: true,
          storeId: true,
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
    throw new Error("No se encontro el jugador del torneo.");
  }

  if (
    session.user.role === "store" &&
    (!session.user.storeId ||
      tournamentPlayer.tournament.storeId !== session.user.storeId)
  ) {
    throw new Error("No autorizado.");
  }

  const tournamentTypeName =
    tournamentPlayer.tournament.typeTournament?.name ?? "";
  const isCompetitiveTier = ["Tier 1", "Tier 2"].includes(tournamentTypeName);

  if (!isCompetitiveTier) {
    throw new Error("Solo disponible para torneos Tier 1 y Tier 2.");
  }

  if (tournamentPlayer.tournament.status !== "in_progress") {
    throw new Error("Solo puedes remover mazos durante el torneo.");
  }

  if (!tournamentPlayer.deckId) {
    throw new Error("El jugador no tiene un mazo asociado.");
  }

  const deckId = tournamentPlayer.deckId;

  await prisma.$transaction(async (tx) => {
    // Libera la asociacion y elimina el mazo duplicado.
    await tx.tournamentPlayer.update({
      where: { id: tournamentPlayerId },
      data: { deckId: null },
    });

    // Limpia likes asociados antes de eliminar el mazo.
    await tx.like.deleteMany({
      where: { deckId },
    });

    await tx.deck.deleteMany({
      where: { id: deckId },
    });
  });

  return {
    playerId: tournamentPlayerId,
  };
}
