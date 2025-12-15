"use server";

import { prisma } from "@/lib/prisma";
import { CreateTournamentSchema, CreateTournamentInput } from "@/schemas";
import { TournamentFormat } from "@prisma/client";

export async function createTournamentAction(input: CreateTournamentInput) {
  const data = CreateTournamentSchema.parse(input);

  // Crear torneo
  const tournament = await prisma.tournament.create({
    data: {
      title: data.title,
      descripcion: data.descripcion,
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
}
