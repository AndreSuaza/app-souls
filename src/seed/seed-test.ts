import { prisma } from "../lib/prisma";

// Evita depender de tipos de Node para este script de seed.
declare const process: { env: { NODE_ENV?: string } };

async function main() {
  const cards = await prisma.card.findMany({
    include: {
      product: {
        select: {
          name: true,
          code: true,
          show: true,
          url: true,
        },
      },
      types: {
        select: {
          name: true,
        },
      },
      keywords: {
        select: {
          name: true,
        },
      },
      rarities: {
        select: {
          name: true,
        },
      },
      archetypes: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      {
        id: "desc",
      },
    ],
  });

  console.log(cards);
}

(() => {
  if (process.env.NODE_ENV === "production") return;
  main();
})();
