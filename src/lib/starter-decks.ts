import { activeCardWhere } from "@/actions/cards/card-status";
import { prisma } from "@/lib/prisma";
import {
  ENCODED_SECTION_SEPARATOR,
  normalizeEncodedDecklist,
  parseEncodedDeckSegment,
} from "@/utils/decklist";
import type { Prisma } from "@prisma/client";

const FALLBACK_ARCHETYPE_ID = "67c5d1595d56151173f8f23b";

type StarterDeckDefinition = {
  name: string;
  description: string;
  deckList: string;
};

export const STARTER_DECK_DEFINITIONS: readonly StarterDeckDefinition[] = [
  {
    name: "Mazo de bienvenida 1",
    description:
      "Mazo inicial para conocer las reglas y probar una primera estrategia de Souls In Xtinction.",
    deckList:
      "OYT-079%3A2%3BGNC-053%3A2%3BOYT-030%3A2%3BOYT-025%3A2%3BOYT-032%3A2%3BOYT-029%3A2%3BOYT-033%3A2%3BOYT-026%3A2%3BAVE-012%3A2%3BOYT-057%3A1%3BP-008%3A2%3BOYT-048%3A2%3BOYT-075%3A2%3BOYT-015%3A1%3BAVE-072%3A2%3BGNC-031%3A2%3BMO-035%3A2%3BOYT-066%3A2%3BOYT-037%3A2%3BOYT-047%3A2%3BOYT-031%3A2%3BOYT-067%3A1%3BOYT-078%3A2%3BOYT-045%3A1%3BOYT-023%3A2%3B%7C",
  },
  {
    name: "Mazo de bienvenida 2",
    description:
      "Mazo inicial alternativo para experimentar otra forma de jugar Souls In Xtinction.",
    deckList:
      "OYT-003%3A2%3BMO-079%3A1%3BOYT-002%3A2%3BOYT-006%3A2%3BOYT-057%3A1%3BOYT-008%3A2%3BAVE-014%3A2%3BSMC01-022%3A2%3BOYT-048%3A2%3BOYT-012%3A2%3BOYT-015%3A2%3BEDA-013%3A2%3BOYT-010%3A2%3BOYT-049%3A1%3BMO-035%3A2%3BOYT-005%3A2%3BOYT-066%3A2%3BOYT-019%3A2%3BRDL-001%3A1%3BOYT-046%3A1%3BOYT-047%3A2%3BME4-009%3A1%3BOYT-072%3A2%3BOYT-007%3A2%3BCAT-069%3A1%3BME6-015AA%3A1%3BAVE-004%3A2%3B%7C",
  },
] as const;

type StarterCard = {
  archetypes: { id: string; name: string }[];
  code: string;
  idd: string;
  types: { name: string }[];
};

const normalizeTypeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const starterEntries = (deckList: string) => {
  const normalized = normalizeEncodedDecklist(deckList);
  const [mainDeck = ""] = normalized.split(ENCODED_SECTION_SEPARATOR);
  return parseEncodedDeckSegment(mainDeck);
};

const resolveArchetypeId = (
  entries: ReturnType<typeof starterEntries>,
  cardsByCode: Map<string, StarterCard>,
) => {
  let totalUnitCards = 0;
  let cardsWithoutArchetype = 0;
  const counts = new Map<string, number>();

  for (const entry of entries) {
    const card = cardsByCode.get(entry.key);
    if (!card) continue;

    const isUnit = card.types.some(
      (type) => normalizeTypeName(type.name) === "unidad",
    );
    if (!isUnit) continue;

    totalUnitCards += entry.count;
    const archetype = card.archetypes.find((item) => item.name.trim());
    if (!archetype) {
      cardsWithoutArchetype += entry.count;
      continue;
    }

    counts.set(archetype.id, (counts.get(archetype.id) ?? 0) + entry.count);
  }

  if (totalUnitCards === 0 || cardsWithoutArchetype / totalUnitCards > 0.5) {
    return FALLBACK_ARCHETYPE_ID;
  }

  let selectedId = FALLBACK_ARCHETYPE_ID;
  let selectedCount = -1;
  for (const [archetypeId, count] of counts) {
    if (count > selectedCount) {
      selectedId = archetypeId;
      selectedCount = count;
    }
  }

  return selectedId;
};

type StarterDeckDb = Pick<typeof prisma, "card" | "deck">;

export async function createStarterDecksForUser(
  db: StarterDeckDb | Prisma.TransactionClient,
  userId: string,
) {
  const entriesByDeck = STARTER_DECK_DEFINITIONS.map((definition) =>
    starterEntries(definition.deckList),
  );
  const cardCodes = Array.from(
    new Set(entriesByDeck.flatMap((entries) => entries.map((entry) => entry.key))),
  );
  const cards = await db.card.findMany({
    where: {
      AND: [activeCardWhere(), { code: { in: cardCodes } }],
    },
    select: {
      archetypes: { select: { id: true, name: true } },
      code: true,
      idd: true,
      types: { select: { name: true } },
    },
  });
  const cardsByCode = new Map<string, StarterCard>();
  cards.forEach((card) => cardsByCode.set(card.code, card));

  const missingCode = cardCodes.find((code) => !cardsByCode.has(code));
  if (missingCode) {
    throw new Error(`No se encontró la carta del mazo inicial: ${missingCode}`);
  }

  const data = STARTER_DECK_DEFINITIONS.map((definition, index) => {
    const entries = entriesByDeck[index];
    const firstCard = cardsByCode.get(entries[0]?.key ?? "");
    if (!firstCard) {
      throw new Error(`El mazo inicial ${definition.name} no tiene cartas válidas.`);
    }

    const cardsNumber = entries.reduce((total, entry) => total + entry.count, 0);
    if (cardsNumber !== 46) {
      throw new Error(`El mazo inicial ${definition.name} debe tener 46 cartas.`);
    }

    return {
      archetypeId: resolveArchetypeId(entries, cardsByCode),
      cards: definition.deckList,
      cardsNumber,
      description: definition.description,
      imagen: `${firstCard.code}-${firstCard.idd}`,
      isAdminDeck: false,
      name: definition.name,
      tokenCards: null,
      tokenCardsNumber: 0,
      userId,
      visible: false,
    };
  });

  await db.deck.createMany({ data });
}
