"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import clsx from "clsx";
import { OptionsDeckCreator } from "./OptionsDeckCreator";
import { Decklist } from "@/interfaces/decklist.interface";
import { CardFinder } from "../card-finder/CardFinder";
import { ShowDeck } from "./ShowDeck";
import { CardDetail } from "../card-detail/CardDetail";
import { getPaginatedCards } from "@/actions";
import type { PaginationFilters, Card } from "@/interfaces";

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
  // Controla el colapso del panel de busqueda para pantallas grandes.
  const [isFinderCollapsed, setIsFinderCollapsed] = useState(false);
  // Evita transiciones costosas mientras se alterna la vista de pantalla completa.
  const [isFullscreenToggling, setIsFullscreenToggling] = useState(false);
  const fullscreenToggleRef = useRef<number | null>(null);
  // Centraliza el modal de detalle para evitar duplicados entre buscador y mazos.
  const [detailCards, setDetailCards] = useState<Card[]>([]);
  const [detailIndex, setDetailIndex] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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

  useEffect(() => {
    return () => {
      if (fullscreenToggleRef.current !== null) {
        window.clearTimeout(fullscreenToggleRef.current);
      }
    };
  }, []);

  const handleToggleFinderCollapse = useCallback(() => {
    setIsFinderCollapsed((prev) => !prev);
    setIsFullscreenToggling(true);
    if (fullscreenToggleRef.current !== null) {
      window.clearTimeout(fullscreenToggleRef.current);
    }
    fullscreenToggleRef.current = window.setTimeout(() => {
      setIsFullscreenToggling(false);
    }, 350);
  }, []);

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

  const getCardCountsByDeck = useCallback(
    (cardId: string) => {
      const countIn = (list: Decklist[]) =>
        list.reduce(
          (acc, deck) => (deck.card.id === cardId ? acc + deck.count : acc),
          0,
        );
      return {
        main: countIn(deckListMain),
        limbo: countIn(deckListLimbo),
        side: countIn(deckListSide),
      };
    },
    [deckListMain, deckListLimbo, deckListSide],
  );

  const addCard = (cardSeleted: Card) => {
    const counts = getCardCountsByDeck(cardSeleted.id);
    const totalCount = counts.main + counts.limbo + counts.side;
    // Las legendarias solo pueden existir en un mazo a la vez, pero permiten 2 copias dentro del mismo.
    if (cardSeleted.limit === "1") {
      const isLimbo = cardSeleted.types.some((type) => type.name === "Limbo");
      const hasOtherDeck = isLimbo
        ? counts.main > 0 || counts.side > 0
        : counts.limbo > 0 || counts.side > 0;
      if (hasOtherDeck) return;
    }
    if (totalCount >= 2) return;

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
    const counts = getCardCountsByDeck(cardSeleted.id);
    const totalCount = counts.main + counts.limbo + counts.side;
    // Las legendarias solo pueden existir en un mazo a la vez, pero permiten 2 copias dentro del mismo.
    if (cardSeleted.limit === "1") {
      if (counts.main > 0 || counts.limbo > 0) return;
    }
    if (totalCount >= 2) return;

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

  const openDetail = useCallback((cardsList: Card[], index: number) => {
    setDetailCards(cardsList);
    setDetailIndex(index);
    setIsDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  return (
    <div
      className={clsx("flex h-full flex-row gap-0 overflow-hidden", className)}
    >
      {/* min-h-0 permite que cada columna tenga su propio scroll en el layout flex. */}
      <section
        className={clsx(
          "flex min-h-0 min-w-0 flex-col h-full overflow-visible",
          isFinderCollapsed
            ? "flex-none w-0 overflow-hidden opacity-0"
            : "flex-1 w-1/2",
        )}
      >
        <div className="min-h-full overflow-y-auto pr-2 md:px-2 lg:pl-2 lg:pr-0 md:pt-3 pb-10">
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
            enableCompactSearchLayout
            onOpenDetail={openDetail}
            isActive={!isFinderCollapsed}
            disableGridTransitions={isFullscreenToggling}
          />
        </div>
      </section>

      <div className="relative flex shrink-0 items-center justify-center w-0">
        <div className="absolute w-px inset-y-0 left-1/2 -translate-x-1/2 bg-slate-200 dark:bg-tournament-dark-border" />
      </div>

      <section
        className={clsx(
          "flex min-h-0 min-w-0 flex-col pb-10 h-full overflow-y-auto",
          isFinderCollapsed ? "flex-1 w-auto" : "flex-1 w-1/2",
        )}
      >
        <div className="min-h-full px-2 lg:pl-6 lg:pr-4  md:pt-3 pb-10">
          <div className="mt-4 mb-5 w-full">
            <OptionsDeckCreator
              deckListMain={deckListMain}
              deckListLimbo={deckListLimbo}
              deckListSide={deckListSide}
              clearDecklist={clearDecklist}
              isFinderCollapsed={isFinderCollapsed}
              onToggleFinderCollapse={handleToggleFinderCollapse}
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
            onOpenDetail={openDetail}
          />
          <div className="h-6" aria-hidden />
        </div>
      </section>
      {isDetailOpen && detailCards.length > 0 && (
        <CardDetail
          cards={detailCards}
          indexList={detailIndex}
          isOpen={isDetailOpen}
          onClose={closeDetail}
        />
      )}
    </div>
  );
};
