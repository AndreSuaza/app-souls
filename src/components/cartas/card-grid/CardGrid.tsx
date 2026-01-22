"use client";

import type { Card } from "@/interfaces";
import { CardItem } from "./CardItem";
import { CardDetail } from "../card-detail/CardDetail";
import { useState } from "react";
import clsx from "clsx";

interface Props {
  cards: Card[];
  columns?: number;
  smColumns?: number;
  mdColumns?: number;
  lgColumns?: number;
  xlColumns?: number;
  autoColumns?: number;
  addCard?: (c: Card) => void;
  addCardSidedeck?: (c: Card) => void;
  disableAnimations?: boolean;
  disableInitialAnimation?: boolean;
  onOpenDetail?: (cards: Card[], index: number) => void;
}

const getGridClass = (
  breakpoint: "sm" | "md" | "lg" | "xl",
  value: number
) => {
  switch (value) {
    case 1:
      return `${breakpoint}:grid-cols-1`;
    case 2:
      return `${breakpoint}:grid-cols-2`;
    case 3:
      return `${breakpoint}:grid-cols-3`;
    case 4:
      return `${breakpoint}:grid-cols-4`;
    case 5:
      return `${breakpoint}:grid-cols-5`;
    case 7:
      return `${breakpoint}:grid-cols-7`;
    case 8:
      return `${breakpoint}:grid-cols-8`;
    default:
      return `${breakpoint}:grid-cols-6`;
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

export const CardGrid = ({
  cards,
  columns = 6,
  smColumns,
  mdColumns,
  lgColumns,
  xlColumns,
  autoColumns,
  addCard,
  addCardSidedeck,
  disableAnimations = false,
  onOpenDetail,
}: Props) => {
  const [indexDeck, setIndexDeck] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const detailCard = (index: number) => {
    if (onOpenDetail) {
      onOpenDetail(cards, index);
      return;
    }
    setIndexDeck(index);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
  };

  const gridClassName = autoColumns
    ? clsx("grid gap-4", getBaseGridClass(autoColumns))
    : clsx(
        "grid gap-4 grid-cols-1",
        getGridClass("sm", smColumns ?? 2),
        getGridClass("md", mdColumns ?? 4),
        getGridClass("lg", lgColumns ?? columns),
        getGridClass("xl", xlColumns ?? columns)
      );

  return (
    <>
      <div className="mt-4">
        {cards.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 py-16 text-center text-sm font-semibold text-slate-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/60 dark:text-slate-300">
            No se encontraron resultados.
          </div>
        ) : disableAnimations ? (
          <ul className={gridClassName}>
            {cards.map((card, index) => (
              <li key={card.id}>
                <CardItem
                  card={card}
                  addCard={addCard}
                  addCardSidedeck={addCardSidedeck}
                  index={index}
                  detailCard={detailCard}
                />
              </li>
            ))}
          </ul>
        ) : (
          <ul className={gridClassName}>
            {cards.map((card, index) => (
              <li key={card.id}>
                <CardItem
                  card={card}
                  addCard={addCard}
                  addCardSidedeck={addCardSidedeck}
                  index={index}
                  detailCard={detailCard}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      {!onOpenDetail && isDetailOpen && (
        <CardDetail
          cards={cards}
          indexList={indexDeck}
          isOpen={isDetailOpen}
          onClose={closeDetail}
        />
      )}
    </>
  );
};
