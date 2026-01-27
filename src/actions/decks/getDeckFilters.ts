'use server';

import { prisma } from '@/lib/prisma';
import { noStore } from 'next/cache';

export async function getDeckFiltersAction() {
  noStore();

  const archetypes = await prisma.archetype.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return {
    archetypes,
  };
}

