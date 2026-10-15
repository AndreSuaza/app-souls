type TokenEntry = { card: { idd: string }; count: number };

export const tokenCopyKey = (card: TokenEntry["card"]) =>
  card.idd.trim().toLowerCase();

export function hasDuplicateTokenCopies(entries: TokenEntry[]) {
  const seen = new Set<string>();
  return entries.some(({ card, count }) => {
    const key = tokenCopyKey(card);
    if (count > 1 || seen.has(key)) return true;
    seen.add(key);
    return false;
  });
}

export function uniqueTokenEntries<T extends TokenEntry>(entries: T[]): T[] {
  const seen = new Set<string>();
  return entries.flatMap((entry) => {
    const key = tokenCopyKey(entry.card);
    if (entry.count <= 0 || seen.has(key)) return [];
    seen.add(key);
    return [{ ...entry, count: 1 }];
  });
}
