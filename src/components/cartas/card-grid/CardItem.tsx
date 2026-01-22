"use client";

import Image from "next/image";
import { Card } from "@/interfaces/cards.interface";
import { IoAddCircleOutline, IoMedkitOutline } from "react-icons/io5";

interface Props {
  card: Card;
  index: number;
  detailCard: (i: number) => void;
  addCard?: (c: Card) => void;
  addCardSidedeck?: (c: Card) => void;
}

export const CardItem = ({
  card,
  index,
  detailCard,
  addCard,
  addCardSidedeck,
}: Props) => {
  const openDetail = () => {
    detailCard(index);
  };

  return (
    <div key={card.id} className="flex flex-col transition-all hover:-mt-2">
      <div className="relative rounded-lg bg-slate-950/70 shadow-sm shadow-gray-600 fade-in dark:bg-tournament-dark-muted-strong/40 dark:shadow-white">
        <div className="overflow-hidden rounded-lg">
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
        <div className="absolute top-16 -right-2 z-10 flex flex-col items-center gap-1">
          {card.limit === "1" && (
            <div className="rounded-md border border-amber-300 bg-amber-400/90 px-1.5 text-center text-sm font-semibold text-amber-950 shadow-sm">
              1
            </div>
          )}
          {addCard &&
            card.types.filter((type) => type.name === "Alma").length === 0 && (
              <>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/30 text-purple-600 shadow-sm backdrop-blur-sm transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/80 dark:text-purple-200"
                  title="Anadir carta"
                  onClick={() => addCard && addCard(card)}
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
      </div>
    </div>
  );
};
