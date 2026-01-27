'use server';

import { prisma } from '@/lib/prisma';
import { noStore } from 'next/cache';
import { z } from 'zod';

const deckFiltersSchema = z.object({
  tournament: z.enum(['all', 'with', 'without']).default('all'),
  archetypeId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  date: z.enum(['recent', 'old']).default('recent'),
  likes: z.preprocess(
    (value) => value === true || value === 'true' || value === '1',
    z.boolean().default(false),
  ),
});

export type DeckFiltersInput = z.input<typeof deckFiltersSchema>;

export async function getDecksFilteredAction(input: DeckFiltersInput) {
  noStore();

  const filters = deckFiltersSchema.parse(input);

  const where: Parameters<typeof prisma.deck.findMany>[0]['where'] = {
    // Regla de negocio: solo mazos publicos y con el minimo de cartas.
    visible: true,
    cardsNumber: { gte: 40 },
  };

  if (filters.tournament === 'with') {
    where.tournamentId = { not: null };
  }

  if (filters.tournament === 'without') {
    where.tournamentId = null;
  }

  if (filters.archetypeId) {
    where.archetypeId = filters.archetypeId;
  }

  if (filters.likes) {
    // Cuando se filtra por likes, se exige al menos 1 y se prioriza el orden por popularidad.
    where.likesCount = { gt: 0 };
  }

  const orderBy = filters.likes
    ? [
        { likesCount: 'desc' as const },
        { createdAt: 'desc' as const },
      ]
    : [{ createdAt: filters.date === 'old' ? ('asc' as const) : ('desc' as const) }];

  const decks = await prisma.deck.findMany({
    where,
    orderBy,
    include: {
      user: {
        select: {
          nickname: true,
        },
      },
      archetype: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return decks;
}

