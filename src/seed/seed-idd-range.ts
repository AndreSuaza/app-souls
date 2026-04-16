import { prisma } from "../lib/prisma";

// Cantidad de numeros consecutivos requeridos (entre 1000 y 9999).
// comando para ejecutar este script:
// npx ts-node src/seed/seed-idd-range.ts
const REQUIRED_COUNT = 50;
const MIN_IDD = 1000;
const MAX_IDD = 9999;

const extractNumericIdd = (value: string | null): number | null => {
  if (!value) return null;
  const match = value.trim().match(/^(\d{4})/);
  if (!match?.[1]) return null;
  const numeric = Number.parseInt(match[1], 10);
  if (Number.isNaN(numeric)) return null;
  if (numeric < MIN_IDD || numeric > MAX_IDD) return null;
  return numeric;
};

const buildAvailability = (used: Set<number>, size: number) => {
  const availability = Array.from({ length: size }, () => true);
  used.forEach((value) => {
    const index = value - MIN_IDD;
    if (index < 0 || index >= size) return;
    availability[index] = false;
  });
  return availability;
};

const findValidStarts = (availability: boolean[], windowSize: number) => {
  const validStarts: number[] = [];
  let blockedCount = 0;

  for (let index = 0; index < availability.length; index += 1) {
    if (!availability[index]) blockedCount += 1;

    if (index >= windowSize) {
      if (!availability[index - windowSize]) blockedCount -= 1;
    }

    if (index >= windowSize - 1 && blockedCount === 0) {
      const startIndex = index - windowSize + 1;
      validStarts.push(MIN_IDD + startIndex);
    }
  }

  return validStarts;
};

async function main() {
  if (REQUIRED_COUNT <= 0) {
    console.log(
      "[seed-idd-range] La cantidad requerida debe ser un numero positivo.",
    );
    return;
  }

  const totalRange = MAX_IDD - MIN_IDD + 1;
  if (REQUIRED_COUNT > totalRange) {
    console.log(
      "[seed-idd-range] La cantidad requerida excede el rango disponible.",
    );
    return;
  }

  const cards = await prisma.card.findMany({
    select: {
      idd: true,
    },
  });

  const used = new Set<number>();
  cards.forEach((card) => {
    const numeric = extractNumericIdd(card.idd);
    if (numeric !== null) {
      used.add(numeric);
    }
  });

  // Calculamos rangos libres y elegimos uno al azar para mantener variabilidad.
  const availability = buildAvailability(used, totalRange);
  const validStarts = findValidStarts(availability, REQUIRED_COUNT);

  if (validStarts.length === 0) {
    console.log(
      `[seed-idd-range] No se encontro un rango de ${REQUIRED_COUNT} numeros libres.`,
    );
    return;
  }

  const randomIndex = Math.floor(Math.random() * validStarts.length);
  const start = validStarts[randomIndex];
  const end = start + REQUIRED_COUNT - 1;
  const range = Array.from({ length: REQUIRED_COUNT }, (_, idx) => start + idx);

  console.log(
    `[seed-idd-range] Rango encontrado: ${start} - ${end} (${REQUIRED_COUNT} numeros)`,
  );
  console.log("[seed-idd-range] Numeros disponibles:");
  range.forEach((value) => console.log(`- ${value}`));
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error("[seed-idd-range]", error);
  } finally {
    await prisma.$disconnect();
  }
})();
