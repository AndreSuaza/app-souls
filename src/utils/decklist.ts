export type DecklistCodeEntry = {
  code: string;
  count: number;
};

export type ParsedDecklistEntry = {
  key: string;
  count: number;
};

export const ENCODED_ENTRY_SEPARATOR = "%3B";
export const ENCODED_PAIR_SEPARATOR = "%3A";
export const ENCODED_SECTION_SEPARATOR = "%7C";
export const SAFE_DECKLIST_PREFIX = "d1_";

const RAW_DECKLIST_SEPARATOR_REGEX = /[;:|]/;

const encodeBase64Url = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const decodeBase64Url = (value: string) => {
  if (!value || !/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) {
    return null;
  }

  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/")
      + "=".repeat((4 - (value.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
};

export const normalizeEncodedDecklist = (value: string) => {
  const trimmed = value.trim();
  const decodedTransport = trimmed.startsWith(SAFE_DECKLIST_PREFIX)
    ? decodeBase64Url(trimmed.slice(SAFE_DECKLIST_PREFIX.length))
    : trimmed;

  if (decodedTransport === null) return "";

  return decodedTransport
    .replace(/%3a/gi, ENCODED_PAIR_SEPARATOR)
    .replace(/%3b/gi, ENCODED_ENTRY_SEPARATOR)
    .replace(/%7c/gi, ENCODED_SECTION_SEPARATOR);
};

export const hasRawDecklistSeparators = (value: string) =>
  RAW_DECKLIST_SEPARATOR_REGEX.test(value);

export const isEncodedDecklist = (value: string) => {
  if (!value) return false;
  const normalized = normalizeEncodedDecklist(value);
  if (!normalized) return false;
  if (hasRawDecklistSeparators(normalized)) return false;
  return (
    normalized.includes(ENCODED_PAIR_SEPARATOR) &&
    normalized.includes(ENCODED_ENTRY_SEPARATOR)
  );
};

export const safeDecodeDeckToken = (value: string) => {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const serializeEncodedDeckSegment = (entries: DecklistCodeEntry[]) =>
  entries
    .filter((entry) => entry.code.trim().length > 0 && entry.count > 0)
    .map(
      (entry) =>
        `${encodeURIComponent(entry.code)}${ENCODED_PAIR_SEPARATOR}${entry.count}${ENCODED_ENTRY_SEPARATOR}`,
    )
    .join("");

export const serializeEncodedDecklist = (
  mainEntries: DecklistCodeEntry[],
  sideEntries: DecklistCodeEntry[],
) =>
  `${serializeEncodedDeckSegment(mainEntries)}${ENCODED_SECTION_SEPARATOR}${serializeEncodedDeckSegment(sideEntries)}`;

export const encodeDecklistForQueryParam = (decklist: string) => {
  const normalized = normalizeEncodedDecklist(decklist);
  if (!normalized) return "";

  return `${SAFE_DECKLIST_PREFIX}${encodeBase64Url(normalized)}`;
};

export const parseEncodedDeckSegment = (segment: string) => {
  const normalized = normalizeEncodedDecklist(segment);
  if (!normalized || hasRawDecklistSeparators(normalized)) return [];

  return normalized
    .split(ENCODED_ENTRY_SEPARATOR)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap<ParsedDecklistEntry>((entry) => {
      const separatorIndex = entry.indexOf(ENCODED_PAIR_SEPARATOR);
      if (separatorIndex <= 0) return [];

      const encodedKey = entry.slice(0, separatorIndex).trim();
      const countRaw = entry
        .slice(separatorIndex + ENCODED_PAIR_SEPARATOR.length)
        .trim();

      if (!encodedKey || !/^\d+$/.test(countRaw)) return [];

      const key = safeDecodeDeckToken(encodedKey);
      const count = Number.parseInt(countRaw, 10);

      if (!key || Number.isNaN(count) || count <= 0) return [];

      return [{ key, count }];
    });
};
