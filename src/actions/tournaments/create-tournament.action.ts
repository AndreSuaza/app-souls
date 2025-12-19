"use server";

import { prisma } from "@/lib/prisma";
import { CreateTournamentSchema, CreateTournamentInput } from "@/schemas";
import { TournamentFormat } from "@prisma/client";

export async function createTournamentAction(input: CreateTournamentInput) {
  try {
    const data = CreateTournamentSchema.parse(input);

    // Crear torneo
    const tournament = await prisma.tournament.create({
      data: {
        title: data.title,
        description: data.description,
        lat: data.lat,
        lgn: data.lgn,
        image: data.image,
        format: data.format as TournamentFormat,
        date: new Date(data.date),
        maxRounds: data.maxRounds,
        storeId: data.storeId,
        typeTournamentId: data.typeTournamentId,
      },
      select: {
        id: true,
      },
    });

    // Retornar id del torneo creado
    return tournament.id;
  } catch (error) {
    // Log interno para debugging (server only)
    console.error("[createTournamentAction]", error);

    // Error controlado hacia el cliente
    throw new Error(
      error instanceof Error ? error.message : "Error al crear el torneo"
    );
  }
}
