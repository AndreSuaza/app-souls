"use client";

import { CardItemList } from "../card-grid/CardItemList";
import { Card, Decklist } from "@/interfaces";
import { useEffect, useMemo, useRef, useState } from "react";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

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
}

const initialCounts = { und: 0, arm: 0, con: 0, ent: 0 };
const typeMap: Record<string, keyof typeof initialCounts> = {
  Unidad: "und",
  Arma: "arm",
  Conjuro: "con",
  Ente: "ent",
};

const buildDeckStats = (decklist: Decklist[]) => {
  const totals = decklist.reduce(
    (acc, deck) => {
      deck.card.types.forEach((type) => {
        const key = typeMap[type.name];
        if (key) acc[key] += deck.count;
      });
      acc.total += deck.count;
      return acc;
    },
    { ...initialCounts, total: 0 }
  );

  return totals;
};

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
}: Props) => {
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  const [autoColumns, setAutoColumns] = useState<number | null>(null);
  const [sectionsOpen, setSectionsOpen] = useState({
    limbo: true,
    main: true,
    side: true,
  });

  // Calcula estadísticas por sección para mostrar los contadores.
  const mainStats = useMemo(
    () => buildDeckStats(deckListMain),
    [deckListMain]
  );
  const limboStats = useMemo(
    () => buildDeckStats(deckListLimbo),
    [deckListLimbo]
  );
  const sideStats = useMemo(
    () => buildDeckStats(deckListSide),
    [deckListSide]
  );

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const element = gridWrapperRef.current;
    if (!element) return;

    const calculateColumns = (width: number) => {
      const nextColumns = Math.floor(
        (width + GRID_GAP_PX) / (GRID_CARD_MIN_WIDTH + GRID_GAP_PX)
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

  const renderStats = (stats: ReturnType<typeof buildDeckStats>) => (
    <ul className="mb-2 flex flex-row flex-wrap gap-2 rounded-lg bg-slate-900/90 px-2 py-1 text-xs text-white dark:bg-tournament-dark-muted sm:text-sm">
      <li>
        <span className="font-bold">T:</span> {stats.total}
      </li>
      <li>
        <span className="font-bold text-red-600">U:</span> {stats.und}
      </li>
      <li>
        <span className="font-bold text-purple-700">C:</span> {stats.con}
      </li>
      <li>
        <span className="font-bold text-gray-400">A:</span> {stats.arm}
      </li>
      <li>
        <span className="font-bold text-yellow-500">E:</span> {stats.ent}
      </li>
    </ul>
  );

  return (
    <>
      <div
        ref={gridWrapperRef}
        className="mb-6 rounded-lg border border-slate-200 bg-white p-3 text-slate-900 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-100"
      >
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleSection("limbo")}
            className="mb-2 flex w-full items-center justify-between rounded-lg bg-amber-500/90 px-3 py-1 text-left text-xs font-bold uppercase text-white transition hover:bg-amber-500 sm:text-sm md:text-base"
            aria-label="Mostrar u ocultar mazo limbo"
          >
            <span>Mazo Limbo</span>
            {sectionsOpen.limbo ? (
              <IoChevronUpOutline className="h-4 w-4" />
            ) : (
              <IoChevronDownOutline className="h-4 w-4" />
            )}
          </button>
          {renderStats(limboStats)}

          {/* Animación para mantener la misma sensación del grid de /cartas. */}
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
                {deckListLimbo
                  .slice()
                  .reverse()
                  .map((deck, index) => (
                    <motion.div key={deck.card.id + index} layout>
                      <CardItemList
                        card={deck.card}
                        count={deck.count}
                        dropCard={dropCard}
                        addCard={addCard}
                      />
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => toggleSection("main")}
            className="my-2 flex w-full items-center justify-between rounded-lg bg-purple-600 px-3 py-1 text-left text-xs font-bold uppercase text-white transition hover:bg-purple-500 sm:text-sm md:text-base"
            aria-label="Mostrar u ocultar mazo principal"
          >
            <span>Mazo Principal</span>
            {sectionsOpen.main ? (
              <IoChevronUpOutline className="h-4 w-4" />
            ) : (
              <IoChevronDownOutline className="h-4 w-4" />
            )}
          </button>
          {renderStats(mainStats)}
        </div>
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
              {deckListMain
                .slice()
                .reverse()
                .map((deck, index) => (
                  <motion.div key={deck.card.id + index} layout>
                    <CardItemList
                      card={deck.card}
                      count={deck.count}
                      dropCard={dropCard}
                      addCard={addCard}
                    />
                  </motion.div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => toggleSection("side")}
          className="my-2 flex w-full items-center justify-between rounded-lg bg-sky-600 px-3 py-1 text-left text-xs font-bold uppercase text-white transition hover:bg-sky-500 sm:text-sm md:text-base"
          aria-label="Mostrar u ocultar mazo apoyo"
        >
          <span>Mazo Apoyo</span>
          {sectionsOpen.side ? (
            <IoChevronUpOutline className="h-4 w-4" />
          ) : (
            <IoChevronDownOutline className="h-4 w-4" />
          )}
        </button>
        {renderStats(sideStats)}

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
              {deckListSide
                .slice()
                .reverse()
                .map((deck, index) => (
                  <motion.div key={deck.card.id + index} layout>
                    <CardItemList
                      card={deck.card}
                      count={deck.count}
                      dropCard={dropCardSide}
                      addCard={addCardSide}
                    />
                  </motion.div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
