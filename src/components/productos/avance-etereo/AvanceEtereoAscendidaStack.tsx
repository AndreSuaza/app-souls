"use client";

import Image from "next/image";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { TiltCard } from "@/components/ui/tilt/TiltCard";

const cards = [
  {
    id: "ascendida-1",
    src: "/products/avance-etereo/ascendida-1.jpg",
    alt: "Carta Ascendida Avance Etéreo 1",
  },
  {
    id: "ascendida-2",
    src: "/products/avance-etereo/ascendida-2.png",
    alt: "Carta Ascendida Avance Etéreo 2",
  },
];

export function AvanceEtereoAscendidaStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const orderedIndexes = useMemo(
    () => cards.map((_, offset) => (activeIndex + offset) % cards.length),
    [activeIndex],
  );

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative mx-auto h-[390px] w-full max-w-[310px] sm:h-[460px] sm:max-w-[360px]">
        {orderedIndexes.map((cardIndex, position) => {
          const card = cards[cardIndex];
          const isActive = position === 0;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setActiveIndex(cardIndex)}
              aria-label={`Poner al frente ${card.alt}`}
              className={clsx(
                "absolute w-[78%] max-w-[280px] rounded-2xl transition-[left,top,transform] duration-500 ease-in-out",
                isActive
                  ? "left-0 top-0 z-30 rotate-0"
                  : "left-12 top-8 z-20 rotate-6 sm:left-16 sm:top-10",
              )}
            >
              {isActive ? (
                <TiltCard className="w-full">
                  <Image
                    src={card.src}
                    alt={card.alt}
                    title={card.alt}
                    width={360}
                    height={517}
                    sizes="(min-width: 640px) 280px, 240px"
                    className="h-auto w-full rounded-2xl object-cover shadow-2xl"
                  />
                </TiltCard>
              ) : (
                <Image
                  src={card.src}
                  alt={card.alt}
                  title={card.alt}
                  width={360}
                  height={517}
                  sizes="(min-width: 640px) 280px, 240px"
                  className="h-auto w-full rounded-2xl object-cover shadow-xl"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Ir a carta ascendida ${index + 1}`}
            className={clsx(
              "h-2.5 w-2.5 rounded-full border transition-colors",
              activeIndex === index
                ? "border-[#7BE7DE] bg-[#7BE7DE]"
                : "border-slate-600 bg-slate-700",
            )}
          />
        ))}
      </div>
    </div>
  );
}
