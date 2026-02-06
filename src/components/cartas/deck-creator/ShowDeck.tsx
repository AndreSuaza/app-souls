"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CardGrid } from "../card-grid/CardGrid";
import { Card, Decklist } from "@/interfaces";
import { DeckSection } from "./DeckSection";

interface Props {
  deckListMain: Decklist[];
  deckListLimbo: Decklist[];
  deckListSide: Decklist[];
  dropCard?: (c: Card) => void;
  addCard?: (c: Card) => void;
  dropCardSide?: (c: Card) => void;
  addCardSide?: (c: Card) => void;
  columnsLg?: number;
  columnsXl?: number;
  onOpenDetail?: (cards: Card[], index: number) => void;
  allowEdit?: boolean;
  highlightLegendaryCount?: boolean;
}

const GRID_CARD_MIN_WIDTH = 150;
const GRID_GAP_PX = 8;

export const ShowDeck = ({
  deckListMain,
  deckListLimbo,
  deckListSide,
  dropCard,
  addCard,
  dropCardSide,
  addCardSide,
  columnsLg = 4,
  columnsXl = 6,
  onOpenDetail,
  allowEdit = true,
  highlightLegendaryCount = false,
}: Props) => {
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  const [autoColumns, setAutoColumns] = useState<number | null>(null);
  const autoColumnsRef = useRef<number | null>(null);
  const [sectionsOpen, setSectionsOpen] = useState({
    limbo: true,
    main: true,
    side: true,
  });

  // Calcula estadisticas por seccion para mostrar los contadores.
  // const mainStats = useMemo(() => buildDeckStats(deckListMain), [deckListMain]);
  // const limboStats = useMemo(
  //   () => buildDeckStats(deckListLimbo),
  //   [deckListLimbo],
  // );
  // const sideStats = useMemo(() => buildDeckStats(deckListSide), [deckListSide]);

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const element = gridWrapperRef.current;
    if (!element) return;

    const calculateColumns = (width: number) => {
      const nextColumns = Math.floor(
        (width + GRID_GAP_PX) / (GRID_CARD_MIN_WIDTH + GRID_GAP_PX),
      );
      return Math.max(1, Math.min(8, nextColumns));
    };

    // Ajusta columnas segun el ancho real para que el mazo responda al espacio disponible.
    const updateColumns = (width: number) => {
      const nextValue = calculateColumns(width);
      if (autoColumnsRef.current !== nextValue) {
        autoColumnsRef.current = nextValue;
        setAutoColumns(nextValue);
      }
    };

    let frameId: number | null = null;
    let pendingWidth = element.getBoundingClientRect().width;

    // Agrupa las mediciones para evitar recalculos por cada pixel del resize.
    const requestUpdate = (width: number) => {
      pendingWidth = width;
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateColumns(pendingWidth);
      });
    };

    requestUpdate(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        requestUpdate(entry.contentRect.width);
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const limboDeck = deckListLimbo.slice().reverse();
  const mainDeck = deckListMain.slice().reverse();
  const sideDeck = deckListSide.slice().reverse();
  const limboCards = limboDeck.map((deck) => deck.card);
  const mainCards = mainDeck.map((deck) => deck.card);
  const sideCards = sideDeck.map((deck) => deck.card);
  const limboCount = deckListLimbo.reduce((acc, deck) => acc + deck.count, 0);
  const mainCount = deckListMain.reduce((acc, deck) => acc + deck.count, 0);
  const sideCount = deckListSide.reduce((acc, deck) => acc + deck.count, 0);
  // Mapa de conteos para renderizar los badges del mazo en CardGrid.
  const limboCounts = limboDeck.reduce<Record<string, number>>((acc, deck) => {
    acc[deck.card.id] = deck.count;
    return acc;
  }, {});
  const mainCounts = mainDeck.reduce<Record<string, number>>((acc, deck) => {
    acc[deck.card.id] = deck.count;
    return acc;
  }, {});
  const sideCounts = sideDeck.reduce<Record<string, number>>((acc, deck) => {
    acc[deck.card.id] = deck.count;
    return acc;
  }, {});

  const sectionBaseContainerClass =
    "rounded-lg border border-l-4 bg-slate-100/80 text-slate-800 dark:bg-tournament-dark-surface/90 dark:text-slate-100";
  const sectionBaseHeaderClass =
    "relative flex w-full flex-wrap items-start gap-2 border-b bg-slate-200/50 px-3 py-2 pr-6 text-left text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:bg-slate-200/90 dark:bg-tournament-dark-muted/70 dark:text-slate-100 dark:hover:bg-purple-500/10 sm:text-sm";
  const sectionStyles = {
    limbo: {
      container:
        "border-amber-200/80 border-l-amber-500 shadow-[inset_4px_0_10px_rgba(245,158,11,0.2)] dark:border-amber-500/30 dark:border-l-amber-400 dark:shadow-[inset_4px_0_12px_rgba(245,158,11,0.35)]",
      header: "border-b-amber-200/80 dark:border-b-amber-500/30",
      title: "text-amber-600 dark:text-amber-300",
      chevron: "text-amber-500 dark:text-amber-300",
    },
    main: {
      container:
        "border-purple-200/80 border-l-purple-500 shadow-[inset_4px_0_10px_rgba(139,92,246,0.2)] dark:border-purple-500/30 dark:border-l-purple-400 dark:shadow-[inset_4px_0_12px_rgba(139,92,246,0.35)]",
      header: "border-b-purple-200/80 dark:border-b-purple-500/30",
      title: "text-purple-600 dark:text-purple-300",
      chevron: "text-purple-500 dark:text-purple-300",
    },
    side: {
      container:
        "border-sky-200/80 border-l-sky-500 shadow-[inset_4px_0_10px_rgba(56,189,248,0.2)] dark:border-sky-500/30 dark:border-l-sky-400 dark:shadow-[inset_4px_0_12px_rgba(56,189,248,0.35)]",
      header: "border-b-sky-200/80 dark:border-b-sky-500/30",
      title: "text-sky-600 dark:text-sky-300",
      chevron: "text-sky-500 dark:text-sky-300",
    },
  };
  // const statsWrapperClass = "flex flex-wrap items-center gap-2 min-w-0";
  const sectionBodyClass = "px-3 pb-3 pt-3 sm:px-4 sm:pb-4";

  return (
    <div ref={gridWrapperRef} className="mb-6 flex flex-col gap-4">
      <DeckSection
        title="Mazo Limbo"
        count={limboCount}
        isOpen={sectionsOpen.limbo}
        ariaLabel="Mostrar u ocultar mazo limbo"
        onToggle={() => toggleSection("limbo")}
        containerClassName={clsx(
          sectionBaseContainerClass,
          sectionStyles.limbo.container,
        )}
        headerClassName={clsx(
          sectionBaseHeaderClass,
          sectionStyles.limbo.header,
        )}
        titleClassName={sectionStyles.limbo.title}
        chevronClassName={sectionStyles.limbo.chevron}
        countClassName={clsx(
          "rounded-md border bg-transparent px-2 py-0.5 text-[10px] font-semibold dark:shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80",
          sectionStyles.limbo.title,
          "border-amber-300/70 dark:border-tournament-dark-border",
        )}
        titleWrapperClassName="flex flex-1 flex-wrap items-center gap-1 min-w-0 sm:gap-2"
        bodyClassName={sectionBodyClass}
      >
        {sectionsOpen.limbo && autoColumns !== null && (
          <CardGrid
            cards={limboCards}
            autoColumns={autoColumns ?? undefined}
            lgColumns={columnsLg}
            xlColumns={columnsXl}
            addCard={allowEdit ? addCard : undefined}
            dropCard={allowEdit ? dropCard : undefined}
            showDeckActions
            cardCounts={limboCounts}
            showEmptyState={false}
            onOpenDetail={onOpenDetail}
            highlightLegendaryCount={highlightLegendaryCount}
          />
        )}
      </DeckSection>

      <DeckSection
        title="Mazo Principal"
        count={mainCount}
        isOpen={sectionsOpen.main}
        ariaLabel="Mostrar u ocultar mazo principal"
        onToggle={() => toggleSection("main")}
        containerClassName={clsx(
          sectionBaseContainerClass,
          sectionStyles.main.container,
        )}
        headerClassName={clsx(
          sectionBaseHeaderClass,
          sectionStyles.main.header,
        )}
        titleClassName={sectionStyles.main.title}
        chevronClassName={sectionStyles.main.chevron}
        countClassName={clsx(
          "rounded-md border bg-transparent px-2 py-0.5 text-[10px] font-semibold shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80",
          sectionStyles.main.title,
          "border-purple-300/70 dark:border-tournament-dark-border",
        )}
        titleWrapperClassName="flex flex-1 flex-wrap items-center gap-2 min-w-0"
        bodyClassName={sectionBodyClass}
      >
        {sectionsOpen.main && autoColumns !== null && (
          <CardGrid
            cards={mainCards}
            autoColumns={autoColumns ?? undefined}
            lgColumns={columnsLg}
            xlColumns={columnsXl}
            addCard={allowEdit ? addCard : undefined}
            dropCard={allowEdit ? dropCard : undefined}
            showDeckActions
            cardCounts={mainCounts}
            showEmptyState={false}
            onOpenDetail={onOpenDetail}
            highlightLegendaryCount={highlightLegendaryCount}
          />
        )}
      </DeckSection>

      <DeckSection
        title="Mazo Apoyo"
        count={sideCount}
        isOpen={sectionsOpen.side}
        ariaLabel="Mostrar u ocultar mazo apoyo"
        onToggle={() => toggleSection("side")}
        containerClassName={clsx(
          sectionBaseContainerClass,
          sectionStyles.side.container,
        )}
        headerClassName={clsx(
          sectionBaseHeaderClass,
          sectionStyles.side.header,
        )}
        titleClassName={sectionStyles.side.title}
        chevronClassName={sectionStyles.side.chevron}
        countClassName={clsx(
          "rounded-md border bg-transparent px-2 py-0.5 text-[10px] font-semibold shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80",
          sectionStyles.side.title,
          "border-sky-300/70 dark:border-tournament-dark-border",
        )}
        titleWrapperClassName="flex flex-1 flex-wrap items-center gap-2 min-w-0"
        bodyClassName={sectionBodyClass}
      >
        {sectionsOpen.side && autoColumns !== null && (
          <CardGrid
            cards={sideCards}
            autoColumns={autoColumns ?? undefined}
            lgColumns={columnsLg}
            xlColumns={columnsXl}
            addCard={allowEdit ? addCardSide : undefined}
            dropCard={allowEdit ? dropCardSide : undefined}
            showDeckActions
            cardCounts={sideCounts}
            showEmptyState={false}
            onOpenDetail={onOpenDetail}
            highlightLegendaryCount={highlightLegendaryCount}
          />
        )}
      </DeckSection>
    </div>
  );
};
