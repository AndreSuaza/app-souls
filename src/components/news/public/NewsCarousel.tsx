"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import type { PublicNewsCard } from "@/interfaces";
import { NewsCarouselCard } from "./NewsCarouselCard";

type Props = {
  items: PublicNewsCard[];
};

export const NewsCarousel = ({ items }: Props) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const loopItems = useMemo(
    () => (items.length > 0 ? [...items, ...items] : []),
    [items],
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || items.length === 0) return;

    let animationFrame = 0;
    let lastTime = performance.now();
    const halfWidth = () => container.scrollWidth / 2;

    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused) {
        container.scrollLeft += delta * 0.04;
        if (container.scrollLeft >= halfWidth()) {
          // Reinicia el scroll sin salto visible porque el contenido está duplicado.
          container.scrollLeft -= halfWidth();
        }
      }

      animationFrame = requestAnimationFrame(step);
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [items.length, isPaused]);

  const handleScroll = (direction: "prev" | "next") => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = Math.max(container.clientWidth * 0.8, 260);
    const delta = direction === "next" ? amount : -amount;
    container.scrollBy({ left: delta, behavior: "smooth" });

    const half = container.scrollWidth / 2;
    if (container.scrollLeft < 0) {
      container.scrollLeft += half;
    } else if (container.scrollLeft >= half) {
      container.scrollLeft -= half;
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
        No hay noticias recomendadas.
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Noticias anteriores"
        onClick={() => handleScroll("prev")}
        className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-purple-600 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/90 dark:text-white dark:hover:bg-tournament-dark-muted-hover"
      >
        <IoChevronBack className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label="Noticias siguientes"
        onClick={() => handleScroll("next")}
        className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-purple-600 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/90 dark:text-white dark:hover:bg-tournament-dark-muted-hover"
      >
        <IoChevronForward className="h-6 w-6" />
      </button>

      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="overflow-hidden px-16"
      >
        <div className="flex w-max gap-5 py-2">
          {loopItems.map((item, index) => (
            <NewsCarouselCard key={`${item.id}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
