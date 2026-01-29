'use server';

import { prisma } from '@/lib/prisma';

export async function getDeckFiltersAction() {
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

