"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { OptionsDeckCreator } from "@/components/cartas/deck-creator/OptionsDeckCreator";
import { ShowDeck } from "@/components/cartas/deck-creator/ShowDeck";
import type { Deck, Decklist, Card, ArchetypeOption } from "@/interfaces";
import { DeckInfoPanel } from "./DeckInfoPanel";

interface Props {
  deck: Deck;
  mainDeck: Decklist[];
  sideDeck: Decklist[];
  hasSession: boolean;
  archetypes: ArchetypeOption[];
  isOwner: boolean;
  tournamentName?: string | null;
  isLiked?: boolean;
}

const addCardLogic = (
  deckListSelected: Decklist[],
  cardfound: Decklist | undefined,
  cardSeleted: Card,
) => {
  if (cardfound) {
    if (cardfound.count < 2) {
      const updatedCards = deckListSelected.map((deck) =>
        deck.card.name === cardSeleted.name
          ? { card: deck.card, count: 2 }
          : deck,
      );
      return updatedCards;
    }
  } else {
    return [...deckListSelected, { card: cardSeleted, count: 1 }];
  }
};

const dropCardLogic = (
  deckListSelected: Decklist[],
  cardfound: Decklist | undefined,
  cardSeleted: Card,
) => {
  if (cardfound && cardfound.count === 2) {
    const updatedCards = deckListSelected.map((deck) =>
      deck.card.name === cardSeleted.name
        ? { card: deck.card, count: 1 }
        : deck,
    );
    return updatedCards;
  } else {
    return deckListSelected.filter(
      (cardDeck) => cardDeck.card.name !== cardSeleted.name,
    );
  }
};

export const DeckDetailView = ({
  deck,
  mainDeck,
  sideDeck,
  hasSession,
  archetypes,
  isOwner,
  tournamentName,
  isLiked,
}: Props) => {
  const [deckListMain, setDeckListMain] = useState<Decklist[]>(() =>
    mainDeck.filter((c) => !c.card.types.some((type) => type.name === "Limbo")),
  );
  const [deckListLimbo, setDeckListLimbo] = useState<Decklist[]>(() =>
    mainDeck.filter((c) => c.card.types.some((type) => type.name === "Limbo")),
  );
  const [deckListSide, setDeckListSide] = useState<Decklist[]>(() => [
    ...sideDeck,
  ]);
  const [isFinderCollapsed, setIsFinderCollapsed] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const addCard = (cardSeleted: Card) => {
    if (
      cardSeleted.types.filter((type) => type.name === "Limbo").length === 0
    ) {
      const cardfound = deckListMain.find(
        (cardDeck) => cardDeck.card.name === cardSeleted.name,
      );
      const result = addCardLogic(deckListMain, cardfound, cardSeleted);
      if (result) {
        setDeckListMain(result);
      }
    } else {
      const cardfound = deckListLimbo.find(
        (cardDeck) => cardDeck.card.name === cardSeleted.name,
      );
      const result = addCardLogic(deckListLimbo, cardfound, cardSeleted);
      if (result) {
        setDeckListLimbo(result);
      }
    }
  };

  const dropCard = (cardSeleted: Card) => {
    if (
      cardSeleted.types.filter((type) => type.name === "Limbo").length === 0
    ) {
      const cardfound = deckListMain.find(
        (cardDeck) => cardDeck.card.name === cardSeleted.name,
      );
      const result = dropCardLogic(deckListMain, cardfound, cardSeleted);
      if (result) {
        setDeckListMain(result);
      }
    } else {
      const cardfound = deckListLimbo.find(
        (cardDeck) => cardDeck.card.name === cardSeleted.name,
      );
      const result = dropCardLogic(deckListLimbo, cardfound, cardSeleted);
      if (result) {
        setDeckListLimbo(result);
      }
    }
  };

  const addCardSideDeck = (cardSeleted: Card) => {
    const cardfound = deckListSide.find(
      (cardDeck) => cardDeck.card.name === cardSeleted.name,
    );
    const result = addCardLogic(deckListSide, cardfound, cardSeleted);
    if (result) {
      setDeckListSide(result);
    }
  };

  const dropCardSideDeck = (cardSeleted: Card) => {
    const cardfound = deckListSide.find(
      (cardDeck) => cardDeck.card.name === cardSeleted.name,
    );
    const result = dropCardLogic(deckListSide, cardfound, cardSeleted);
    if (result) {
      setDeckListSide(result);
    }
  };

  const clearDecklist = () => {
    setDeckListMain([]);
    setDeckListLimbo([]);
    setDeckListSide([]);
  };

  const query = searchParams?.toString();
  const currentUrl = query ? `${pathname}?${query}` : pathname;

  return (
    <div className="space-y-6">
      <OptionsDeckCreator
        deckListMain={deckListMain}
        deckListLimbo={deckListLimbo}
        deckListSide={deckListSide}
        clearDecklist={clearDecklist}
        isFinderCollapsed={isFinderCollapsed}
        onToggleFinderCollapse={() => setIsFinderCollapsed((prev) => !prev)}
        showSaveControls
        editDeckUrl={isOwner ? `/laboratorio?id=${deck.id}` : undefined}
        cloneDeckUrl={!isOwner ? `/laboratorio?id=${deck.id}` : undefined}
        hasSession={hasSession}
        loginCallbackUrl={currentUrl}
        archetypes={archetypes}
        showFullscreenToggle={false}
        showClearDeck={false}
        showSaveButton={false}
        showEditButton={isOwner}
        showCloneButton={!isOwner}
      />

      <DeckInfoPanel
        deck={deck}
        tournamentName={tournamentName}
        hasSession={hasSession}
        isLiked={isLiked}
      />

      <section className="min-w-0">
        <ShowDeck
          deckListMain={deckListMain}
          deckListLimbo={deckListLimbo}
          deckListSide={deckListSide}
          addCard={addCard}
          dropCard={dropCard}
          addCardSide={addCardSideDeck}
          dropCardSide={dropCardSideDeck}
          columnsLg={4}
          columnsXl={6}
          allowEdit={false}
        />
      </section>
    </div>
  );
};
