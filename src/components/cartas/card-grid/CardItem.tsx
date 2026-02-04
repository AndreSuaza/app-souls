"use client";

import Image from "next/image";
import { Card } from "@/interfaces/cards.interface";
import {
  IoAddCircleOutline,
  IoMedkitOutline,
  IoRemoveCircleOutline,
} from "react-icons/io5";

interface Props {
  card: Card;
  index: number;
  detailCard: (i: number) => void;
  addCard?: (c: Card) => void;
  addCardSidedeck?: (c: Card) => void;
  dropCard?: (c: Card) => void;
  showDeckActions?: boolean;
  count?: number;
  highlightLegendaryCount?: boolean;
}

export const CardItem = ({
  card,
  index,
  detailCard,
  addCard,
  addCardSidedeck,
  dropCard,
  showDeckActions = false,
  count,
  highlightLegendaryCount = false,
}: Props) => {
  const openDetail = () => {
    detailCard(index);
  };

  const actionButtonClass =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/30 text-purple-600 shadow-sm backdrop-blur-sm transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:text-purple-200";
  const removeButtonClass =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/40 text-amber-600 shadow-sm backdrop-blur transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:text-amber-200";
  const countBadgeClass =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/30 text-emerald-700 text-xs font-semibold shadow-sm backdrop-blur-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:text-emerald-200";
  const legendaryCountBadgeClass =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-amber-300 bg-amber-200/90 text-amber-900 text-xs font-semibold shadow-sm backdrop-blur-sm dark:border-amber-400 dark:bg-amber-900/50 dark:text-amber-100";
  const shouldHighlightLegendary =
    highlightLegendaryCount && card.limit === "1";
  const legendaryBadgeValue =
    typeof count === "number" ? count : shouldHighlightLegendary ? 1 : null;

  return (
    <div
      key={card.id}
      className="flex flex-col transform-gpu transition-transform hover:-translate-y-2"
    >
      <div className="relative rounded-lg bg-slate-950/70 fade-in dark:bg-tournament-dark-muted-strong/40">
        <div className="content-visibility-auto overflow-hidden rounded-lg">
          <button
            type="button"
            className="block w-full cursor-pointer"
            onClick={openDetail}
          >
            <Image
              src={`/cards/${card.code}-${card.idd}.webp`}
              alt={card.name}
              className="block w-full object-cover"
              width={500}
              height={718}
            />
          </button>
        </div>
        {showDeckActions ? (
          <div className="absolute top-8 -right-2 z-[1] flex flex-col items-center gap-1">
            {legendaryBadgeValue !== null && (
              <div
                className={
                  shouldHighlightLegendary
                    ? legendaryCountBadgeClass
                    : countBadgeClass
                }
              >
                {legendaryBadgeValue}
              </div>
            )}
            {addCard && (
              <button
                type="button"
                className={actionButtonClass}
                title="Anadir carta"
                onClick={() => addCard(card)}
              >
                <IoAddCircleOutline className="h-5 w-5" />
              </button>
            )}
            {dropCard && (
              <button
                type="button"
                className={removeButtonClass}
                title="Quitar carta"
                onClick={() => dropCard(card)}
              >
                <IoRemoveCircleOutline className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="absolute top-16 -right-2 z-10 flex flex-col items-center gap-1">
            {legendaryBadgeValue !== null && shouldHighlightLegendary && (
              <div className={legendaryCountBadgeClass}>
                {legendaryBadgeValue}
              </div>
            )}
            {addCard &&
              card.types.filter((type) => type.name === "Alma").length ===
                0 && (
                <>
                  <button
                    type="button"
                    className={actionButtonClass}
                    title="Anadir carta"
                    onClick={() => addCard(card)}
                  >
                    <IoAddCircleOutline className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/40 text-sky-600 shadow-sm backdrop-blur transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:text-sky-200"
                    title="Anadir carta mazo apoyo"
                    onClick={() => addCardSidedeck && addCardSidedeck(card)}
                  >
                    <IoMedkitOutline className="h-5 w-5" />
                  </button>
                </>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
