"use client";

import { CardItemList } from "../card-grid/CardItemList";
import { Card, Decklist } from "@/interfaces";
import { useMemo, useState } from "react";
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

  const gridClassName = clsx(
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
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-3 text-slate-900 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-100">
        <div className="flex flex-col">
          <div className="mb-2 flex w-full items-center justify-between rounded-lg bg-amber-500/90 px-3 py-1 text-xs font-bold uppercase text-white sm:text-sm md:text-base">
            <span>Mazo Limbo</span>
            <button
              type="button"
              onClick={() => toggleSection("limbo")}
              className="inline-flex items-center justify-center text-white/90 transition hover:text-white"
              aria-label="Mostrar u ocultar mazo limbo"
            >
              {sectionsOpen.limbo ? (
                <IoChevronUpOutline className="h-4 w-4" />
              ) : (
                <IoChevronDownOutline className="h-4 w-4" />
              )}
            </button>
          </div>
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

          <div className="my-2 flex w-full items-center justify-between rounded-lg bg-purple-600 px-3 py-1 text-xs font-bold uppercase text-white sm:text-sm md:text-base">
            <span>Mazo Principal</span>
            <button
              type="button"
              onClick={() => toggleSection("main")}
              className="inline-flex items-center justify-center text-white/90 transition hover:text-white"
              aria-label="Mostrar u ocultar mazo principal"
            >
              {sectionsOpen.main ? (
                <IoChevronUpOutline className="h-4 w-4" />
              ) : (
                <IoChevronDownOutline className="h-4 w-4" />
              )}
            </button>
          </div>
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

        <div className="my-2 flex w-full items-center justify-between rounded-lg bg-sky-600 px-3 py-1 text-xs font-bold uppercase text-white sm:text-sm md:text-base">
          <span>Mazo Apoyo</span>
          <button
            type="button"
            onClick={() => toggleSection("side")}
            className="inline-flex items-center justify-center text-white/90 transition hover:text-white"
            aria-label="Mostrar u ocultar mazo apoyo"
          >
            {sectionsOpen.side ? (
              <IoChevronUpOutline className="h-4 w-4" />
            ) : (
              <IoChevronDownOutline className="h-4 w-4" />
            )}
          </button>
        </div>
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
