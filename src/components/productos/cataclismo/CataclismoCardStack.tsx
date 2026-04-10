"use client";

import Image from "next/image";
import clsx from "clsx";
import { useMemo, useState } from "react";

interface CardItem {
  id: string;
  src: string;
  alt: string;
}

interface CataclismoCardStackProps {
  cards: CardItem[];
}

export function CataclismoCardStack({ cards }: CataclismoCardStackProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const orderedIndexes = useMemo(
    () => cards.map((_, offset) => (activeIndex + offset) % cards.length),
    [cards, activeIndex],
  );

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative h-[380px] w-full max-w-[320px]">
        {orderedIndexes.map((cardIndex, position) => {
          const card = cards[cardIndex];
          const isActive = position === 0;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveIndex(cardIndex)}
              className={clsx(
                "absolute w-[72%] rounded-2xl transition-[transform,left,top] duration-500 ease-in-out",
                isActive ? "hover:-translate-y-2" : "hover:-translate-y-1",
                position === 0 && "left-0 top-0 z-30 rotate-0 shadow-2xl",
                position === 1 && "left-10 top-6 z-20 rotate-6 shadow-xl",
                position === 2 && "left-20 top-12 z-10 rotate-12 shadow-lg",
              )}
            >
              <Image
                src={card.src}
                alt={card.alt}
                title={card.alt}
                width={360}
                height={520}
                className="h-auto w-full rounded-2xl object-cover"
              />
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Ir a carta ${index + 1}`}
            className={clsx(
              "h-2.5 w-2.5 rounded-full border transition-colors",
              activeIndex === index
                ? "border-rose-400 bg-rose-400"
                : "border-slate-600 bg-slate-700",
            )}
          />
        ))}
      </div>
    </div>
  );
}
