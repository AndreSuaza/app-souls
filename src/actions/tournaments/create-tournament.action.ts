"use server";

import { prisma } from "@/lib/prisma";
import { CreateTournamentSchema, CreateTournamentInput } from "@/schemas";

export async function createTournament(input: CreateTournamentInput) {
  const data = CreateTournamentSchema.parse(input);

  // Crear torneo sin URL
  const tournament = await prisma.tournament.create({
    data: {
      title: data.title,
      descripcion: data.descripcion,
      lat: data.lat,
      lgn: data.lgn,
      image: data.image,
      format: data.format,
      date: new Date(data.date),
      maxRounds: data.maxRounds,
      storeId: data.storeId,
      typeTournamentId: data.typeTournamentId,
      url: "", // temporal para luego actualizar
    },
    select: {
      id: true,
      title: true,
      descripcion: true,
      format: true,
      date: true,
      status: true,
    },
  });

  // Generar URL real basada en ID
  const generatedUrl = `admin/torneos/${tournament.id}`;

  // Actualizar torneo con su URL definitiva
  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { url: generatedUrl },
  });

  // Retornar información útil (sin sobrecargar al store)
  return {
    ...tournament,
    url: generatedUrl,
  };
}
