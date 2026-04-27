"use client";

import { ShowDeck } from "@/components/cartas/deck-creator/ShowDeck";
import { Decklist } from "@/interfaces";
import { useEffect, useState, useCallback } from "react";
import { splitMainAndLimboDeck } from "@/utils/deck-sections";

interface Props {
  mainDeck?: Decklist[];
  sideDeck?: Decklist[];
  expectedMainCount?: number;
}

export const DeckDetail = ({ mainDeck, sideDeck, expectedMainCount }: Props) => {
  const [deckListMain, setDeckListMain] = useState<Decklist[]>([]);
  const [deckListLimbo, setDeckListLimbo] = useState<Decklist[]>([]);
  const [deckListSide, setDeckListSide] = useState<Decklist[]>([]);

  const importDeck = useCallback(() => {
    if (mainDeck) {
      const { mainDeck: main, limboDeck: limbo } = splitMainAndLimboDeck(
        mainDeck,
        {
          expectedMainCount,
        },
      );

      const mainCount = main.reduce((acc, deck) => acc + deck.count, 0);
      const limboCount = limbo.reduce((acc, deck) => acc + deck.count, 0);

      if (mainCount <= 40) setDeckListMain(main);
      if (limboCount <= 6) setDeckListLimbo(limbo);
    }

    if (sideDeck) {
      const side = [...sideDeck];
      const sideCount = side.reduce((acc, deck) => acc + deck.count, 0);

      if (sideCount <= 40) setDeckListSide(side);
    }
  }, [expectedMainCount, mainDeck, sideDeck]);

  useEffect(() => {
    importDeck();
  }, [importDeck]);

  return (
    <ShowDeck
      deckListMain={deckListMain}
      deckListLimbo={deckListLimbo}
      deckListSide={deckListSide}
    />
  );
};
