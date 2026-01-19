"use client";

import type { Card } from "@/interfaces";
import { useEffect, useState, useCallback, useRef } from "react";
import clsx from "clsx";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { OptionsDeckCreator } from "./OptionsDeckCreator";
import { Decklist } from "@/interfaces/decklist.interface";
import { CardFinder } from "../card-finder/CardFinder";
import { ShowDeck } from "./ShowDeck";
import { getPaginatedCards } from "@/actions";
import type { PaginationFilters } from "@/interfaces";

interface Propertie {
  id: string;
  name: string;
}

interface Properties {
  products: Propertie[];
  types: Propertie[];
  archetypes: Propertie[];
  keywords: Propertie[];
  rarities: Propertie[];
}

interface Props {
  cards: Card[];
  propertiesCards: Properties;
  totalPages: number;
  totalCards?: number;
  perPage?: number;
  mainDeck?: Decklist[];
  sideDeck?: Decklist[];
  className?: string;
  initialFilters?: PaginationFilters;
  initialPage?: number;
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
      (cardDeck) => cardDeck.card.name != cardSeleted.name,
    );
  }
};

const addCardDecklist = (deckListSelected: Decklist[], cardSeleted: Card) => {
  const cardfound = deckListSelected.find(
    (cardDeck) => cardDeck.card.name == cardSeleted.name,
  );

  return addCardLogic(deckListSelected, cardfound, cardSeleted);
};

const dropCardDecklist = (deckListSelected: Decklist[], cardSeleted: Card) => {
  const cardfound = deckListSelected.find(
    (cardDeck) => cardDeck.card.name == cardSeleted.name,
  );

  return dropCardLogic(deckListSelected, cardfound, cardSeleted);
};

export const DeckCreator = ({
  cards,
  propertiesCards,
  totalPages,
  totalCards,
  perPage,
  mainDeck,
  sideDeck,
  initialFilters,
  initialPage = 1,
  className,
}: Props) => {
  const hasImportedRef = useRef(false);
  const [cardsState, setCardsState] = useState(cards);
  const [totalPagesState, setTotalPagesState] = useState(totalPages);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentFilters, setCurrentFilters] = useState<PaginationFilters>(
    initialFilters ?? {},
  );
  const [deckListMain, setDeckListMain] = useState<Decklist[]>([]);
  const [deckListLimbo, setDeckListLimbo] = useState<Decklist[]>([]);
  const [deckListSide, setDeckListSide] = useState<Decklist[]>([]);
  const [viewList, setViewList] = useState(false);
  // Controla el colapso del panel de busqueda para pantallas grandes.
  const [isFinderCollapsed, setIsFinderCollapsed] = useState(false);

  const importDeck = useCallback(() => {
    const hasIncomingDeck =
      (mainDeck?.length ?? 0) > 0 || (sideDeck?.length ?? 0) > 0;

    // Evita sobrescribir el mazo del usuario cuando cambian los filtros/busquedas.
    if (hasImportedRef.current || !hasIncomingDeck) return;

    if (mainDeck) {
      const main = mainDeck.filter(
        (c) => !c.card.types.some((type) => type.name === "Limbo"),
      );
      const limbo = mainDeck.filter((c) =>
        c.card.types.some((type) => type.name === "Limbo"),
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

    hasImportedRef.current = true;
  }, [mainDeck, sideDeck]);

  useEffect(() => {
    importDeck();
  }, [importDeck]);

  const fetchCards = useCallback(
    async (filters: PaginationFilters, page: number) => {
      // Se consulta el mismo action desde cliente para filtrar/paginar sin recargar la ruta.
      const result = await getPaginatedCards({
        page,
        ...filters,
      });

      setCardsState(result.cards);
      setTotalPagesState(result.totalPage);
      setCurrentPage(result.currentPage ?? page);
    },
    [],
  );

  const handleSearch = useCallback(
    async (filters: PaginationFilters) => {
      // Mantiene filtros/paginado en memoria para evitar dependencia de la URL.
      setCurrentFilters(filters);
      await fetchCards(filters, 1);
    },
    [fetchCards],
  );

  const handlePageChange = useCallback(
    async (page: number) => {
      await fetchCards(currentFilters, page);
    },
    [currentFilters, fetchCards],
  );

  const addCard = (cardSeleted: Card) => {
    if (cardSeleted.types.filter((type) => type.name === "Alma").length > 0) {
      return;
    }
    if (cardSeleted.types.filter((type) => type.name === "Ficha").length > 0) {
      return;
    }

    if (
      cardSeleted.types.filter((type) => type.name === "Limbo").length === 0
    ) {
      if (deckListMain.reduce((acc, deck) => acc + deck.count, 0) > 39) return;
      const result = addCardDecklist(deckListMain, cardSeleted);
      if (result) {
        setDeckListMain(result);
      }
    } else {
      if (deckListLimbo.reduce((acc, deck) => acc + deck.count, 0) > 5) return;

      const result = addCardDecklist(deckListLimbo, cardSeleted);
      if (result) {
        setDeckListLimbo(result);
      }
    }
  };

  const dropCard = (cardSeleted: Card) => {
    if (
      cardSeleted.types.filter((type) => type.name === "Limbo").length === 0
    ) {
      const result = dropCardDecklist(deckListMain, cardSeleted);
      if (result) {
        setDeckListMain(result);
      }
    } else {
      const result = dropCardDecklist(deckListLimbo, cardSeleted);
      if (result) {
        setDeckListLimbo(result);
      }
    }
  };

  const dropCardSideDeck = (cardSeleted: Card) => {
    const result = dropCardDecklist(deckListSide, cardSeleted);
    if (result) {
      setDeckListSide(result);
    }
  };

  const addCardSideDeck = (cardSeleted: Card) => {
    if (cardSeleted.types.filter((type) => type.name === "Alma").length > 0) {
      return;
    }
    if (cardSeleted.types.filter((type) => type.name === "Ficha").length > 0) {
      return;
    }
    if (deckListSide.reduce((acc, deck) => acc + deck.count, 0) > 9) return;

    const result = addCardDecklist(deckListSide, cardSeleted);
    if (result) {
      setDeckListSide(result);
    }
  };

  const clearDecklist = () => {
    setDeckListMain([]);
    setDeckListLimbo([]);
    setDeckListSide([]);
  };

  const changeViewList = () => {
    setViewList(!viewList);
  };

  return (
    <div
      className={clsx(
        "flex h-full flex-col gap-4 overflow-y-auto lg:flex-row lg:gap-0 lg:overflow-hidden",
        className,
      )}
    >
      {/* min-h-0 permite que cada columna tenga su propio scroll en el layout flex. */}
      <section
        className={clsx(
          "flex min-h-0 min-w-0 flex-col lg:h-full lg:overflow-y-auto",
          isFinderCollapsed
            ? "lg:flex-none lg:w-0 lg:overflow-hidden lg:opacity-0"
            : "lg:flex-1 lg:w-1/2",
        )}
      >
        <div className="min-h-0 px-4 pt-4 pb-6 lg:min-h-full lg:pb-10">
          <CardFinder
            cards={cardsState}
            propertiesCards={propertiesCards}
            totalPage={totalPagesState}
            cols={2}
            addCard={addCard}
            addCardSidedeck={addCardSideDeck}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            totalCards={totalCards}
            perPage={perPage}
            useAdvancedFilters
            layoutVariant="embedded"
            layoutColumns={{ md: 2, lg: 4, xl: 4 }}
            layoutColumnsOpen={{ lg: 1, xl: 2 }}
            disableUrlSync
            disableGridAnimations
          />
        </div>
      </section>

      <div className="relative hidden w-10 items-center justify-center lg:flex">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-slate-200 dark:bg-tournament-dark-border" />
        <button
          type="button"
          onClick={() => setIsFinderCollapsed((prev) => !prev)}
          title={
            isFinderCollapsed
              ? "Expandir buscador de cartas"
              : "Contraer buscador de cartas"
          }
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-purple-400 bg-purple-600 text-white shadow-md transition hover:bg-purple-500 dark:border-purple-300 dark:bg-purple-500"
          aria-label={
            isFinderCollapsed
              ? "Expandir buscador de cartas"
              : "Contraer buscador de cartas"
          }
        >
          {isFinderCollapsed ? (
            <IoChevronForwardOutline className="h-5 w-5" />
          ) : (
            <IoChevronBackOutline className="h-5 w-5" />
          )}
        </button>
      </div>

      <section
        className={clsx(
          "flex min-h-0 min-w-0 flex-col pb-6 lg:h-full lg:overflow-y-auto lg:pb-10",
          isFinderCollapsed ? "lg:flex-1 lg:w-auto" : "lg:flex-1 lg:w-1/2",
        )}
      >
        <div className="min-h-0 px-4 pt-4 pb-6 lg:min-h-full lg:pb-10">
          <div className="my-3 w-full">
            <OptionsDeckCreator
              deckListMain={deckListMain}
              deckListLimbo={deckListLimbo}
              deckListSide={deckListSide}
              clearDecklist={clearDecklist}
              changeViewList={changeViewList}
              viewList={viewList}
            />
          </div>
          <ShowDeck
            deckListMain={deckListMain}
            deckListLimbo={deckListLimbo}
            deckListSide={deckListSide}
            addCard={addCard}
            dropCard={dropCard}
            addCardSide={addCardSideDeck}
            dropCardSide={dropCardSideDeck}
            columnsLg={isFinderCollapsed ? 6 : 4}
            columnsXl={isFinderCollapsed ? 8 : 4}
          />
          <div className="h-6" aria-hidden />
        </div>
      </section>
    </div>
  );
};
