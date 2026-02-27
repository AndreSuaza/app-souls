"use client";

import Image from "next/image";
import Link from "next/link";
import { IoChevronForwardOutline } from "react-icons/io5";

interface ProductCard {
  id: string;
  idd: string;
  code: string;
  name: string;
  price: number | null;
  rarities: { name: string }[];
}

interface Props {
  cards: ProductCard[];
}

export function BovedaProductCardsTable({ cards }: Props) {
  const priceFormatter = new Intl.NumberFormat("es-CO");

  return (
    <div className="space-y-3">
      {cards.map((card) => {
        const rarityText = card.rarities
          .map((rarity) => rarity.name)
          .join(", ");
        const priceText =
          card.price != null
            ? `$${priceFormatter.format(card.price)}`
            : "Sin precio";

        return (
          <Link
            key={card.id}
            href={`/boveda/${card.id}`}
            className="group grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-purple-300 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:hover:border-purple-400/40 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] sm:items-center"
          >
            <div className="flex items-center gap-4">
              <div className="h-20 w-14 overflow-hidden rounded-lg border border-slate-200 dark:border-tournament-dark-border">
                <Image
                  src={`/cards/${card.code}-${card.idd}.webp`}
                  alt={card.name}
                  width={200}
                  height={280}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {card.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {card.code}-{card.idd}
                </p>
                {rarityText && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {rarityText}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center text-right sm:text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Precio
              </p>
              <p className="text-base font-bold text-purple-600 dark:text-purple-300">
                {priceText}
              </p>
            </div>

            <div className="col-span-2 flex justify-end sm:col-span-1 sm:justify-end">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition group-hover:text-purple-600 dark:text-slate-200 dark:group-hover:text-purple-300">
                Ver
                <IoChevronForwardOutline className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
