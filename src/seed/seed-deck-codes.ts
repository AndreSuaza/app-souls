import { prisma } from "../lib/prisma";
import {
  normalizeEncodedDecklist,
  serializeEncodedDecklist,
} from "../utils/decklist";

type DeckPair = { token: string; count: number };
type ParsedDeckSections = { mainPairs: DeckPair[]; sidePairs: DeckPair[] };

type CatalogContext = {
  knownTokens: Set<string>;
  iddToCode: Map<string, string>;
  codeToCode: Map<string, string>;
};

const safeDecode = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
};

const normalizeDecklistForMigration = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  // Decodifica una vez para soportar variantes exportadas como `%253A/%253B/%257C`.
  const decodedOnce = safeDecode(trimmed);
  const encodedNormalized = normalizeEncodedDecklist(decodedOnce);

  // En seed permitimos parsear variantes legacy y luego serializar al formato canonico.
  return encodedNormalized
    .replace(/%7C/gi, "|")
    .replace(/%3B/gi, ";")
    .replace(/%3A/gi, ":");
};

const parseColonSegment = (segment: string): DeckPair[] => {
  if (!segment) return [];

  return segment
    .split(";")
    .map((entry: string) => entry.trim())
    .filter(Boolean)
    .reduce<DeckPair[]>((acc, entry: string) => {
      const separatorIndex = entry.indexOf(":");
      if (separatorIndex <= 0) return acc;

      const rawToken = entry.slice(0, separatorIndex).trim();
      const countRaw = entry.slice(separatorIndex + 1).trim();
      if (!rawToken || !/^\d+$/.test(countRaw)) return acc;

      const token = safeDecode(rawToken);
      const count = Number.parseInt(countRaw, 10);
      if (!token || Number.isNaN(count) || count <= 0) return acc;

      acc.push({ token, count });
      return acc;
    }, []);
};

const splitLegacyTokens = (segment: string) => {
  if (!segment) return [];
  // Soporta mezclas de `%2C` y coma para limpiar decklists muy antiguas.
  return segment
    .split(/%2C|,/gi)
    .map((token) => safeDecode(token))
    .filter(Boolean);
};

const isNumericToken = (value: string) => /^\d+$/.test(value.trim());

const parseLegacyPairs = (tokens: string[], knownTokens: Set<string>) => {
  const pairs: DeckPair[] = [];
  let index = 0;

  while (index < tokens.length) {
    let resolved: { token: string; count: number; nextIndex: number } | null =
      null;

    // Busca el token mas largo conocido para no romper codigos que incluyen comas.
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
      if (resolved.count > 0) {
        pairs.push({ token: resolved.token, count: resolved.count });
      }
      index = resolved.nextIndex;
      continue;
    }

    const token = tokens[index]?.trim();
    const countRaw = tokens[index + 1];
    if (!token || !countRaw || !isNumericToken(countRaw)) {
      index += 1;
      continue;
    }

    const count = Number.parseInt(countRaw, 10);
    if (!Number.isNaN(count) && count > 0) {
      pairs.push({ token, count });
    }
    index += 2;
  }

  return pairs;
};

const parseDecklistForMigration = (
  value: string,
  knownTokens: Set<string>,
): ParsedDeckSections | null => {
  const normalized = normalizeDecklistForMigration(value);
  if (!normalized) return null;

  const [mainRaw = "", sideRaw = ""] = normalized.split("|");

  if (normalized.includes(":")) {
    const mainPairs = parseColonSegment(mainRaw);
    const sidePairs = parseColonSegment(sideRaw);
    if (mainPairs.length === 0 && sidePairs.length === 0) {
      return null;
    }

    return { mainPairs, sidePairs };
  }

  const mainTokens = splitLegacyTokens(mainRaw);
  const sideTokens = splitLegacyTokens(sideRaw);

  const mainPairs = parseLegacyPairs(mainTokens, knownTokens);
  const sidePairs = parseLegacyPairs(sideTokens, knownTokens);

  if (mainPairs.length === 0 && sidePairs.length === 0) {
    return null;
  }

  return { mainPairs, sidePairs };
};

const resolveCanonicalCode = (token: string, context: CatalogContext) => {
  const decoded = safeDecode(token);
  return (
    context.iddToCode.get(decoded) ??
    context.iddToCode.get(token) ??
    context.codeToCode.get(decoded) ??
    context.codeToCode.get(token)
  );
};

const toCanonicalDecklist = (
  input: string,
  context: CatalogContext,
): { decklist: string | null; missingTokens: string[]; malformed: boolean } => {
  const parsed = parseDecklistForMigration(input, context.knownTokens);
  if (!parsed) {
    return { decklist: null, missingTokens: [], malformed: true };
  }

  const missingTokens = new Set<string>();

  const toEntries = (pairs: DeckPair[]) => {
    const entries: Array<{ code: string; count: number }> = [];

    pairs.forEach((pair) => {
      const resolvedCode = resolveCanonicalCode(pair.token, context);
      if (!resolvedCode) {
        missingTokens.add(pair.token);
        // Conserva el token original para no bloquear la migracion de separadores.
        entries.push({ code: pair.token, count: pair.count });
        return;
      }

      entries.push({ code: resolvedCode, count: pair.count });
    });

    return entries;
  };

  const mainEntries = toEntries(parsed.mainPairs);
  const sideEntries = toEntries(parsed.sidePairs);

  if (mainEntries.length === 0 && sideEntries.length === 0) {
    return { decklist: null, missingTokens: [], malformed: true };
  }

  return {
    decklist: serializeEncodedDecklist(mainEntries, sideEntries),
    missingTokens: Array.from(missingTokens.values()),
    malformed: false,
  };
};

const DECK_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const migrateDecklistsInsideMarkdown = (
  content: string,
  context: CatalogContext,
  newsId: string,
  missingByNews: Map<string, Set<string>>,
) => {
  if (!content) return content;

  return content.replace(
    /\[([^\]]*?)\]\(([^)\s]+)([^)]*)\)/g,
    (fullMatch, text: string, hrefRaw: string, suffix: string) => {
      const href = (hrefRaw ?? "").trim();
      if (!href) return fullMatch;
      if (/^https?:\/\//i.test(href)) return fullMatch;
      if (/^(mailto:|tel:|#|\/)/i.test(href)) return fullMatch;
      if (DECK_ID_REGEX.test(href)) return fullMatch;

      const converted = toCanonicalDecklist(href, context);

      if (converted.missingTokens.length > 0) {
        if (!missingByNews.has(newsId)) {
          missingByNews.set(newsId, new Set());
        }
        converted.missingTokens.forEach((token) => {
          missingByNews.get(newsId)?.add(token);
        });
      }

      if (!converted.decklist) return fullMatch;

      const normalizedCurrent = normalizeEncodedDecklist(href);
      if (converted.decklist === normalizedCurrent) {
        return fullMatch;
      }

      return `[${text}](${converted.decklist}${suffix ?? ""})`;
    },
  );
};

async function main() {
  const [decks, cardsCatalog, news] = await Promise.all([
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
    prisma.new.findMany({
      select: { id: true, content: true },
    }),
  ]);

  const knownTokens = new Set<string>();
  const iddToCode = new Map<string, string>();
  const codeToCode = new Map<string, string>();

  cardsCatalog.forEach((card) => {
    knownTokens.add(card.idd);
    knownTokens.add(card.code);
    knownTokens.add(encodeURIComponent(card.code));

    const decodedCode = safeDecode(card.code);
    if (decodedCode) {
      knownTokens.add(decodedCode);
    }

    if (!iddToCode.has(card.idd)) {
      iddToCode.set(card.idd, card.code);
    }

    if (!codeToCode.has(card.code)) {
      codeToCode.set(card.code, card.code);
    }

    if (decodedCode && !codeToCode.has(decodedCode)) {
      codeToCode.set(decodedCode, card.code);
    }

    const encodedCode = encodeURIComponent(card.code);
    if (!codeToCode.has(encodedCode)) {
      codeToCode.set(encodedCode, card.code);
    }
  });

  const context: CatalogContext = {
    knownTokens,
    iddToCode,
    codeToCode,
  };

  let updatedDecks = 0;
  let unchangedDecks = 0;
  let malformedDecks = 0;
  const missingByDeck = new Map<string, Set<string>>();

  for (const deck of decks) {
    const rawCards = deck.cards?.trim() ?? "";
    if (!rawCards) {
      unchangedDecks += 1;
      continue;
    }

    const converted = toCanonicalDecklist(rawCards, context);

    if (converted.missingTokens.length > 0) {
      if (!missingByDeck.has(deck.id)) {
        missingByDeck.set(deck.id, new Set());
      }
      converted.missingTokens.forEach((token) => {
        missingByDeck.get(deck.id)?.add(token);
      });
    }

    if (!converted.decklist) {
      if (converted.malformed) {
        malformedDecks += 1;
      }
      unchangedDecks += 1;
      continue;
    }

    const normalizedCurrent = normalizeEncodedDecklist(rawCards);
    if (converted.decklist === normalizedCurrent) {
      unchangedDecks += 1;
      continue;
    }

    await prisma.deck.update({
      where: { id: deck.id },
      data: { cards: converted.decklist },
    });

    updatedDecks += 1;

    if (updatedDecks % 200 === 0) {
      console.log(`Mazos actualizados: ${updatedDecks}`);
    }
  }

  let updatedNews = 0;
  let unchangedNews = 0;
  const missingByNews = new Map<string, Set<string>>();

  for (const article of news) {
    const currentContent = article.content ?? "";
    if (!currentContent.trim()) {
      unchangedNews += 1;
      continue;
    }

    const migratedContent = migrateDecklistsInsideMarkdown(
      currentContent,
      context,
      article.id,
      missingByNews,
    );

    if (migratedContent === currentContent) {
      unchangedNews += 1;
      continue;
    }

    await prisma.new.update({
      where: { id: article.id },
      data: { content: migratedContent },
    });

    updatedNews += 1;
  }

  console.log(`Proceso finalizado. Mazos actualizados: ${updatedDecks}`);
  console.log(`Mazos sin cambios: ${unchangedDecks}`);
  console.log(`Mazos con formato irregular: ${malformedDecks}`);

  console.log(`Noticias actualizadas: ${updatedNews}`);
  console.log(`Noticias sin cambios: ${unchangedNews}`);

  if (missingByDeck.size > 0) {
    console.log("Mazos con tokens sin equivalencia de code:");
    missingByDeck.forEach((tokens, deckId) => {
      tokens.forEach((token) => {
        console.log(`- deck: ${deckId} | token: ${token}`);
      });
    });
  }

  if (missingByNews.size > 0) {
    console.log("Noticias con decklist no migrado por tokens sin equivalencia:");
    missingByNews.forEach((tokens, newsId) => {
      tokens.forEach((token) => {
        console.log(`- noticia: ${newsId} | token: ${token}`);
      });
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
