"use server";

import { prisma } from "@/lib/prisma";
import { FinalizeRoundSchema } from "@/schemas";
import { calculateBuchholzForPlayers } from "@/modules";
import {
  TournamentMatchForProcessing,
  TournamentRoundForProcessing,
  TournamentPlayerForSwiss,
} from "@/interfaces";

// Procesa todos los matches de la ronda, actualizando puntos, BYE y rivales.
async function processMatchResults(
  round: TournamentRoundForProcessing,
  players: TournamentPlayerForSwiss[]
) {
  for (const match of round.matches) {
    const p1 = players.find((p) => p.id === match.player1Id);
    const p2 = players.find((p) => p.id === match.player2Id);

    if (!p1) continue;

    // BYE
    if (!match.player2Id || match.player2Nickname === "BYE") {
      await prisma.tournamentPlayer.update({
        where: { id: p1.id },
        data: {
          points: { increment: 3 },
          hadBye: true,
        },
      });
      continue;
    }

    if (!p2) continue;

    // Registrar rivales usando push
    await prisma.tournamentPlayer.update({
      where: { id: p1.id },
      data: { rivals: { push: p2.id } },
    });

    await prisma.tournamentPlayer.update({
      where: { id: p2.id },
      data: { rivals: { push: p1.id } },
    });

    // Asignar puntos por resultado
    if (match.result === "P1") {
      await prisma.tournamentPlayer.update({
        where: { id: p1.id },
        data: { points: { increment: 3 } },
      });
    } else if (match.result === "P2") {
      await prisma.tournamentPlayer.update({
        where: { id: p2.id },
        data: { points: { increment: 3 } },
      });
    } else if (match.result === "DRAW") {
      await prisma.tournamentPlayer.update({
        where: { id: p1.id },
        data: { points: { increment: 1 } },
      });
      await prisma.tournamentPlayer.update({
        where: { id: p2.id },
        data: { points: { increment: 1 } },
      });
    }
  }
}

// Recalcula Buchholz de todos los jugadores del torneo
async function recalculateBuchholz(tournamentId: string) {
  const players = await prisma.tournamentPlayer.findMany({
    where: { tournamentId },
  });

  const updated = calculateBuchholzForPlayers(players);

  for (const p of updated) {
    await prisma.tournamentPlayer.update({
      where: { id: p.id },
      data: { buchholz: p.buchholz },
    });
  }
}

export async function finalizeRound_action(input: unknown) {
  const data = FinalizeRoundSchema.parse(input);

  // Buscar torneo
  const tournament = await prisma.tournament.findUnique({
    where: { id: data.tournamentId },
  });

  if (!tournament) throw new Error("Torneo no encontrado");

  // Buscar ronda
  const round = await prisma.round.findUnique({
    where: { id: data.roundId },
    include: { matches: true },
  });

  if (!round) throw new Error("Ronda no encontrada");

  // Validar matches pendientes
  const pendingMatches = round.matches.filter((m) => m.result === null);

  if (pendingMatches.length > 0) {
    throw new Error(
      "No puedes finalizar la ronda: hay partidas sin resultado."
    );
  }

  // Obtener jugadores
  const players = await prisma.tournamentPlayer.findMany({
    where: { tournamentId: data.tournamentId },
  });

  // Aplicar lógica Swiss
  await processMatchResults(round, players);

  // Marcar ronda como finalizada
  await prisma.round.update({
    where: { id: round.id },
    data: { status: "finished" },
  });

  // Marcar matches como finalizados
  await prisma.match.updateMany({
    where: { roundId: round.id },
    data: { status: "finished" },
  });

  // Recalcular Buchholz
  await recalculateBuchholz(data.tournamentId);

  // Actualizar estado del torneo
  const updatedTournament = await prisma.tournament.update({
    where: { id: data.tournamentId },
    data: {
      currentRoundNumber: round.roundNumber,
      status:
        round.roundNumber === tournament.maxRounds
          ? "pending_finalization"
          : "in_progress",
    },
  });

  return updatedTournament;
}
