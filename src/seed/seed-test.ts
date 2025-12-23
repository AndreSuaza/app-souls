import { prisma } from "../lib/prisma";

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
      price: {
        include: {
          rarity: true,
        },
        orderBy: {
          price: "asc",
        },
        distinct: ["rarityId"],
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
