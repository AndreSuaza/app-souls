"use client";

import clsx from "clsx";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { CardItemList } from "../card-grid/CardItemList";
import { Card, Decklist } from "@/interfaces";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
}

const initialCounts = { und: 0, arm: 0, con: 0, ent: 0 };
const typeMap: Record<string, keyof typeof initialCounts> = {
  Unidad: "und",
  Arma: "arm",
  Conjuro: "con",
  Ente: "ent",
};

// const buildDeckStats = (decklist: Decklist[]) => {
//   const totals = decklist.reduce(
//     (acc, deck) => {
//       deck.card.types.forEach((type) => {
//         const key = typeMap[type.name];
//         if (key) acc[key] += deck.count;
//       });
//       acc.total += deck.count;
//       return acc;
//     },
//     { ...initialCounts, total: 0 },
//   );

//   return totals;
// };

const GRID_CARD_MIN_WIDTH = 120;
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
}: Props) => {
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  const [autoColumns, setAutoColumns] = useState<number | null>(null);
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
      setAutoColumns((prev) => (prev === nextValue ? prev : nextValue));
    };

    updateColumns(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        updateColumns(entry.contentRect.width);
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const getGridClass = (breakpoint: "lg" | "xl", value: number) => {
    switch (value) {
      case 4:
        return `${breakpoint}:grid-cols-4`;
      case 6:
        return `${breakpoint}:grid-cols-6`;
      case 8:
        return `${breakpoint}:grid-cols-8`;
      default:
        return `${breakpoint}:grid-cols-4`;
    }
  };

  const getBaseGridClass = (value: number) => {
    switch (value) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      case 7:
        return "grid-cols-7";
      case 8:
        return "grid-cols-8";
      default:
        return "grid-cols-6";
    }
  };

  const gridClassName = autoColumns
    ? clsx("grid gap-2", getBaseGridClass(autoColumns))
    : clsx(
        "grid grid-cols-1 gap-2 md:grid-cols-4",
        getGridClass("lg", columnsLg),
        getGridClass("xl", columnsXl),
      );

  const limboDeck = deckListLimbo.slice().reverse();
  const mainDeck = deckListMain.slice().reverse();
  const sideDeck = deckListSide.slice().reverse();
  const limboCards = limboDeck.map((deck) => deck.card);
  const mainCards = mainDeck.map((deck) => deck.card);
  const sideCards = sideDeck.map((deck) => deck.card);

  const sectionBaseContainerClass =
    "rounded-lg border border-l-4 bg-slate-100/80 text-slate-800 overflow-hidden dark:bg-tournament-dark-surface/90 dark:text-slate-100";
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
  const statsWrapperClass = "flex flex-wrap items-center gap-2 min-w-0";
  const sectionBodyClass = "px-3 pb-3 pt-3 sm:px-4 sm:pb-4";

  return (
    <div ref={gridWrapperRef} className="mb-6 flex flex-col gap-4">
      <section
        className={clsx(
          sectionBaseContainerClass,
          sectionStyles.limbo.container,
        )}
      >
        <button
          type="button"
          onClick={() => toggleSection("limbo")}
          className={clsx(sectionBaseHeaderClass, sectionStyles.limbo.header)}
          aria-label="Mostrar u ocultar mazo limbo"
        >
          <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
            <span className={clsx("shrink-0", sectionStyles.limbo.title)}>
              Mazo Limbo
            </span>
            {/* <div className={statsWrapperClass}>
              <DeckStatsChips stats={limboStats} />
            </div> */}
          </div>
          {sectionsOpen.limbo ? (
            <IoChevronUpOutline
              className={clsx(
                "absolute right-2 top-2 h-4 w-4",
                sectionStyles.limbo.chevron,
              )}
            />
          ) : (
            <IoChevronDownOutline
              className={clsx(
                "absolute right-2 top-2 h-4 w-4",
                sectionStyles.limbo.chevron,
              )}
            />
          )}
        </button>

        <div className={sectionBodyClass}>
          {/* Animacion para mantener la misma sensacion del grid de /cartas. */}
          <AnimatePresence initial={false}>
            {sectionsOpen.limbo && (
              <motion.div
                key="limbo-grid"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={gridClassName}
              >
                {limboDeck.map((deck, index) => (
                    <motion.div key={deck.card.id + index} layout>
                      <CardItemList
                        card={deck.card}
                        count={deck.count}
                        dropCard={dropCard}
                        addCard={addCard}
                        onOpenDetail={() =>
                          onOpenDetail?.(limboCards, index)
                        }
                      />
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section
        className={clsx(
          sectionBaseContainerClass,
          sectionStyles.main.container,
        )}
      >
        <button
          type="button"
          onClick={() => toggleSection("main")}
          className={clsx(sectionBaseHeaderClass, sectionStyles.main.header)}
          aria-label="Mostrar u ocultar mazo principal"
        >
          <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
            <span className={clsx("shrink-0", sectionStyles.main.title)}>
              Mazo Principal
            </span>
            {/* <div className={statsWrapperClass}>
              <DeckStatsChips stats={mainStats} />
            </div> */}
          </div>
          {sectionsOpen.main ? (
            <IoChevronUpOutline
              className={clsx(
                "absolute right-2 top-2 h-4 w-4",
                sectionStyles.main.chevron,
              )}
            />
          ) : (
            <IoChevronDownOutline
              className={clsx(
                "absolute right-2 top-2 h-4 w-4",
                sectionStyles.main.chevron,
              )}
            />
          )}
        </button>

        <div className={sectionBodyClass}>
          <AnimatePresence initial={false}>
            {sectionsOpen.main && (
              <motion.div
                key="main-grid"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={gridClassName}
              >
                {mainDeck.map((deck, index) => (
                    <motion.div key={deck.card.id + index} layout>
                      <CardItemList
                        card={deck.card}
                        count={deck.count}
                        dropCard={dropCard}
                        addCard={addCard}
                        onOpenDetail={() =>
                          onOpenDetail?.(mainCards, index)
                        }
                      />
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section
        className={clsx(
          sectionBaseContainerClass,
          sectionStyles.side.container,
        )}
      >
        <button
          type="button"
          onClick={() => toggleSection("side")}
          className={clsx(sectionBaseHeaderClass, sectionStyles.side.header)}
          aria-label="Mostrar u ocultar mazo apoyo"
        >
          <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
            <span className={clsx("shrink-0", sectionStyles.side.title)}>
              Mazo Apoyo
            </span>
            {/* <div className={statsWrapperClass}>
              <DeckStatsChips stats={sideStats} />
            </div> */}
          </div>
          {sectionsOpen.side ? (
            <IoChevronUpOutline
              className={clsx(
                "absolute right-2 top-2 h-4 w-4",
                sectionStyles.side.chevron,
              )}
            />
          ) : (
            <IoChevronDownOutline
              className={clsx(
                "absolute right-2 top-2 h-4 w-4",
                sectionStyles.side.chevron,
              )}
            />
          )}
        </button>

        <div className={sectionBodyClass}>
          <AnimatePresence initial={false}>
            {sectionsOpen.side && (
              <motion.div
                key="side-grid"
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={gridClassName}
              >
                {sideDeck.map((deck, index) => (
                    <motion.div key={deck.card.id + index} layout>
                      <CardItemList
                        card={deck.card}
                        count={deck.count}
                        dropCard={dropCardSide}
                        addCard={addCardSide}
                        onOpenDetail={() =>
                          onOpenDetail?.(sideCards, index)
                        }
                      />
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};
