"use server";

import { prisma } from "@/lib/prisma";
import { RoundInterface, TournamentPlayerInterface } from "@/interfaces";
import { assertCanManageTournament } from "./tournament-action-auth";

const areStringArraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export async function finalizeRoundAction(
  tournamentId: string,
  round: RoundInterface,
  players: TournamentPlayerInterface[]
) {
  try {
    await assertCanManageTournament(tournamentId);

    if (!round) throw new Error("Ronda no encontrada");

    // Validar que no hayan matches pendientes
    if (round.matches.some((m) => m.result === null)) {
      throw new Error(
        "No puedes finalizar la ronda: hay partidas sin resultado."
      );
    }

    const persistedPlayers = await prisma.tournamentPlayer.findMany({
      where: {
        tournamentId,
        id: { in: players.map((player) => player.id) },
      },
      select: {
        id: true,
        points: true,
        rivals: true,
        hadBye: true,
        buchholz: true,
      },
    });
    const persistedPlayerById = new Map(
      persistedPlayers.map((player) => [player.id, player])
    );
    const changedPlayers = players.filter((player) => {
      const persistedPlayer = persistedPlayerById.get(player.id);
      if (!persistedPlayer) return false;

      return (
        persistedPlayer.points !== player.points ||
        persistedPlayer.hadBye !== player.hadBye ||
        persistedPlayer.buchholz !== player.buchholz ||
        !areStringArraysEqual(persistedPlayer.rivals, player.rivals)
      );
    });

    // Persiste solo jugadores modificados para reducir escrituras en torneos grandes.
    await prisma.$transaction([
      ...changedPlayers.map((p) =>
        prisma.tournamentPlayer.update({
          where: { id: p.id },
          data: {
            points: p.points,
            rivals: p.rivals,
            hadBye: p.hadBye,
            buchholz: p.buchholz,
          },
        })
      ),
      prisma.tournament.update({
        where: { id: tournamentId },
        data: { currentRoundNumber: { increment: 1 } },
      }),
      prisma.round.update({
        where: { id: round.id },
        data: { finishedAt: new Date() },
      }),
    ]);
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[finalizeRoundAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error ? error.message : "Error al finalizar la ronda"
    );
  }
}
