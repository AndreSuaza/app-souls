import { prisma } from "../lib/prisma";

// Seed: migra `deck.cards` desde formato basado en `idd` hacia `code`,
// preservando el orden y las cantidades de cada carta.

const normalizeDecklist = (value: string) => {
  let normalized = value.trim();
  if (!normalized) return normalized;

  // Solo normalizamos el separador del sideboard para no romper códigos con `%2C`.
  if (/%7C/i.test(normalized)) {
    normalized = normalized.replace(/%7C/gi, "|");
  }

  return normalized;
};

type DeckPair = { idd: string; count: number };

const isNumericToken = (value: string) => /^\d+$/.test(value.trim());

const safeDecodeToken = (token: string) => {
  const trimmed = token.trim();
  if (!trimmed) return "";
  if (!trimmed.includes("%")) return trimmed;
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
};

const splitTokens = (segment: string) => {
  if (!segment) return [];
  // Soporta mezclas de separadores (%2C y coma) para limpiar decks corruptos.
  const rawTokens = segment.split(/%2C|,/gi);
  return rawTokens.map((token) => safeDecodeToken(token)).filter(Boolean);
};

const parsePairs = (tokens: string[], knownTokens: Set<string>): DeckPair[] => {
  const pairs: DeckPair[] = [];
  let index = 0;

  while (index < tokens.length) {
    let resolved: { token: string; count: number; nextIndex: number } | null =
      null;

    // Busca el token mas largo que exista en cards (evita partir codigos con comas).
    const maxJoin = Math.min(tokens.length - 2, index + 6);
    for (let end = index; end <= maxJoin; end += 1) {
      const candidate = tokens.slice(index, end + 1).join(",");
      if (!knownTokens.has(candidate)) continue;
      const countToken = tokens[end + 1];
      if (!countToken || !isNumericToken(countToken)) continue;
      const countValue = Number.parseInt(countToken, 10);
      resolved = {
        token: candidate,
        count: Number.isNaN(countValue) ? 0 : countValue,
        nextIndex: end + 2,
      };
    }

    if (resolved) {
      pairs.push({ idd: resolved.token, count: resolved.count });
      index = resolved.nextIndex;
      continue;
    }

    const idd = tokens[index]?.trim();
    if (!idd) {
      index += 1;
      continue;
    }

    const countValue = Number.parseInt(tokens[index + 1] ?? "0", 10);
    pairs.push({ idd, count: Number.isNaN(countValue) ? 0 : countValue });
    index += 2;
  }

  return pairs;
};

async function main() {
  const [decks, cardsCatalog] = await Promise.all([
    prisma.deck.findMany({
      select: {
        id: true,
        cards: true,
      },
    }),
    prisma.card.findMany({
      orderBy: { createDate: "asc" },
      select: { idd: true, code: true },
    }),
  ]);

  const knownTokens = new Set<string>();
  const iddToCode = new Map<string, string>();
  const codeToCode = new Map<string, string>();

  cardsCatalog.forEach((card) => {
    knownTokens.add(card.idd);
    knownTokens.add(card.code);
    if (!iddToCode.has(card.idd)) {
      iddToCode.set(card.idd, card.code);
    }
    if (!codeToCode.has(card.code)) {
      codeToCode.set(card.code, card.code);
    }
  });

  let updated = 0;
  let skipped = 0;
  const missingCodes = new Map<string, Set<string>>();
  const malformedDecks: string[] = [];

  for (const deck of decks) {
    if (!deck.cards) {
      skipped += 1;
      continue;
    }

    const normalized = normalizeDecklist(deck.cards);
    if (normalized.includes(";") || normalized.includes(":")) {
      // Ya esta en el nuevo formato code:count; no se vuelve a procesar.
      skipped += 1;
      continue;
    }
    const [mainRaw = "", sideRaw = ""] = normalized.split("|");
    const mainTokens = splitTokens(mainRaw);
    const sideTokens = splitTokens(sideRaw);

    if (mainTokens.length % 2 !== 0 || sideTokens.length % 2 !== 0) {
      malformedDecks.push(deck.id);
    }

    const mainPairs = parsePairs(mainTokens, knownTokens);
    const sidePairs = parsePairs(sideTokens, knownTokens);

    if (mainPairs.length === 0 && sidePairs.length === 0) {
      skipped += 1;
      continue;
    }

    const resolveCode = (token: string) =>
      iddToCode.get(token) ?? codeToCode.get(token);

    const buildSegment = (pairs: DeckPair[]) => {
      return pairs
        .map((pair) => {
          const code = resolveCode(pair.idd);
          if (!code) {
            if (!missingCodes.has(deck.id)) {
              missingCodes.set(deck.id, new Set());
            }
            missingCodes.get(deck.id)?.add(pair.idd);
            return null;
          }
          return `${encodeURIComponent(code)}:${pair.count};`;
        })
        .filter(Boolean)
        .join("");
    };

    const mainEncoded = buildSegment(mainPairs);
    const sideEncoded = buildSegment(sidePairs);
    const nextDecklist = `${mainEncoded}|${sideEncoded}`;

    if (nextDecklist === deck.cards) {
      skipped += 1;
      continue;
    }

    await prisma.deck.update({
      where: { id: deck.id },
      data: { cards: nextDecklist },
    });

    updated += 1;

    if (updated % 200 === 0) {
      console.log(`Mazos actualizados: ${updated}`);
    }
  }

  console.log(`Proceso finalizado. Mazos actualizados: ${updated}`);
  console.log(`Mazos sin cambios: ${skipped}`);

  if (missingCodes.size > 0) {
    console.log("Decks con cartas sin code:");
    missingCodes.forEach((values, deckId) => {
      values.forEach((idd) => {
        console.log(`- deck: ${deckId} | idd: ${idd}`);
      });
    });
  }

  if (malformedDecks.length > 0) {
    console.log("Decks con formato irregular (tokens impares):");
    malformedDecks.forEach((deckId) => {
      console.log(`- deck: ${deckId}`);
    });
  }
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error("[seed-deck-codes]", error);
  } finally {
    await prisma.$disconnect();
  }
})();
