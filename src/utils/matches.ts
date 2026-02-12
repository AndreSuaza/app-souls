import type { MatchInterface } from "@/interfaces";

const isByeMatch = (match: MatchInterface) =>
  !match.player2Id || match.player2Nickname === "BYE";

export const orderMatchesByBye = (matches: MatchInterface[]) => {
  // Mantiene el orden original y mueve los BYE al final de la lista.
  const withoutBye: MatchInterface[] = [];
  const withBye: MatchInterface[] = [];

  matches.forEach((match) => {
    if (isByeMatch(match)) {
      withBye.push(match);
    } else {
      withoutBye.push(match);
    }
  });

  return [...withoutBye, ...withBye];
};
