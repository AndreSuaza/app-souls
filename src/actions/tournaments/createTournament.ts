"use server";

import { prisma } from "@/lib/prisma";
import { CreateTournamentSchema } from "@/schemas";

export async function createTournament_action(input: unknown) {
  const data = CreateTournamentSchema.parse(input);

  const tournament = await prisma.tournament.create({
    data: {
      title: data.title,
      descripcion: data.descripcion,
      url: data.url,
      lat: data.lat,
      lgn: data.lgn,
      image: data.image,
      format: data.format,
      date: new Date(data.date),
      maxRounds: data.maxRounds,
      storeId: data.storeId,
      typeTournamentId: data.typeTournamentId,
    },
  });

  return tournament;
}
