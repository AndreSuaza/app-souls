"use client";

import { ShowDeck } from "@/components/cartas/deck-creator/ShowDeck";
import { Decklist } from "@/interfaces";
import { useEffect, useState, useCallback } from "react";

interface Props {
  mainDeck?: Decklist[];
  sideDeck?: Decklist[];
}

export const DeckDetail = ({ mainDeck, sideDeck }: Props) => {
  const [deckListMain, setDeckListMain] = useState<Decklist[]>([]);
  const [deckListLimbo, setDeckListLimbo] = useState<Decklist[]>([]);
  const [deckListSide, setDeckListSide] = useState<Decklist[]>([]);

  const importDeck = useCallback(() => {
    if (mainDeck) {
      const main = mainDeck.filter(
        (c) => !c.card.types.some((type) => type.name === "Limbo")
      );
      const limbo = mainDeck.filter((c) =>
        c.card.types.some((type) => type.name === "Limbo")
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
  }, [mainDeck, sideDeck]);

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
