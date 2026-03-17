import { prisma } from "../lib/prisma";
import { buildCardSlug } from "../utils/card-slug";

async function main() {
  // Actualiza todos los slugs de cartas para mantener la ruta /boveda consistente.
  const cards = await prisma.card.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
  });

  let processed = 0;

  for (const card of cards) {
    const slug = buildCardSlug(card.name, card.code);
    await prisma.card.update({
      where: { id: card.id },
      data: { slug },
    });
    processed += 1;

    if (processed % 500 === 0) {
      console.log(`Slugs actualizados: ${processed}`);
    }
  }

  console.log(`Proceso finalizado. Total: ${processed}`);
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error("[seed-card-slugs]", error);
  } finally {
    await prisma.$disconnect();
  }
})();
