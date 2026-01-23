"use client";

import Image from "next/image";
import clsx from "clsx";
import { useMemo, useState } from "react";

export function PikingosShowcaseSection() {
  const cards = useMemo(
    () => [
      {
        id: "pikingos-1",
        src: "/products/pikingos/1Pikingo.webp",
        alt: "Carta Pikingos principal",
      },
      {
        id: "pikingos-2",
        src: "/products/pikingos/2Pikingo.webp",
        alt: "Carta Pikingos secundaria",
      },
      {
        id: "pikingos-3",
        src: "/products/pikingos/3Pikingo.webp",
        alt: "Carta Pikingos terciaria",
      },
    ],
    [],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const orderedIndexes = useMemo(
    () => cards.map((_, offset) => (activeIndex + offset) % cards.length),
    [cards, activeIndex],
  );

  return (
    <>
      {/* Referencia modo light: bg-white/10, text-slate-900, text-slate-700, dots border-slate-300 bg-slate-200 */}
      <section className="w-full bg-purple-950/40 py-16 md:py-20 backdrop-blur-sm">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-0 lg:px-10">
          <div className="order-2 flex flex-col items-center justify-center lg:order-none lg:items-start">
            <div className="flex w-full max-w-[300px] flex-col items-center sm:max-w-[360px] lg:items-start">
              <div className="relative h-[420px] w-full">
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
                        isActive
                          ? "hover:-translate-y-2"
                          : "hover:-translate-y-1",
                        position === 0 &&
                          "left-0 top-0 z-30 rotate-0 shadow-2xl",
                        position === 1 && "left-10 top-6 z-20 rotate-6 shadow-xl",
                        position === 2 &&
                          "left-20 top-12 z-10 rotate-12 shadow-lg",
                      )}
                    >
                      <Image
                        src={card.src}
                        alt={card.alt}
                        width={360}
                        height={520}
                        className="h-auto w-full rounded-2xl object-cover"
                      />
                    </button>
                  );
                })}
              </div>
              <div className="mt-10 flex w-full items-center justify-center gap-2">
                {cards.map((card, index) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Ir a carta ${index + 1}`}
                    className={clsx(
                      "h-2.5 w-2.5 rounded-full border transition-colors",
                      activeIndex === index
                        ? "border-purple-500 bg-purple-500"
                        : "border-slate-600 bg-slate-700",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 text-center lg:order-none lg:text-left px-4 sm:px-10 lg:px-0">
            <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
              Unidades tenaces en la batalla por alcanzar el val Ala. 
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-200 sm:text-base">
              Desde territorios marcados por el acero y la conquista, los Pikingos descienden como una fuerza despiadada. No llegan por azar ni por gloria: llegan a reclamar y establecer dominio.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
