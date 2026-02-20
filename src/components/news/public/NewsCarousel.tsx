"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import type { PublicNewsCard } from "@/interfaces";
import { NewsCarouselCard } from "./NewsCarouselCard";

type Props = {
  items: PublicNewsCard[];
};

export const NewsCarousel = ({ items }: Props) => {
  const [mobileVisibleCount, setMobileVisibleCount] = useState(3);
  const [startIndex, setStartIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardWidth, setCardWidth] = useState(300);
  const desktopItems = useMemo(() => items, [items]);

  const mobileItems = useMemo(
    () => items.slice(0, mobileVisibleCount),
    [items, mobileVisibleCount],
  );

  useEffect(() => {
    if (mobileVisibleCount > items.length) {
      setMobileVisibleCount(items.length);
    }
  }, [items.length, mobileVisibleCount]);

  useEffect(() => {
    if (startIndex > Math.max(0, items.length - 3)) {
      setStartIndex(0);
    }
  }, [items.length, startIndex]);

  useEffect(() => {
    const updateCardWidth = () => {
      if (!cardRef.current) return;
      setCardWidth(cardRef.current.offsetWidth);
    };

    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);

    return () => {
      window.removeEventListener("resize", updateCardWidth);
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
        No hay noticias recomendadas.
      </div>
    );
  }

  const canLoadMore = mobileVisibleCount < items.length;
  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + 3 < items.length;
  const gap = 24;
  const translateX = startIndex * (cardWidth + gap);

  return (
    <div className="relative">
      <div className="relative hidden sm:block">
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Noticias anteriores"
            onClick={() => setStartIndex((current) => Math.max(0, current - 1))}
            className="absolute -left-6 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-purple-600 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/90 dark:text-white dark:hover:bg-tournament-dark-muted-hover"
          >
            <IoChevronBack className="h-6 w-6" />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Noticias siguientes"
            onClick={() =>
              setStartIndex((current) =>
                Math.min(items.length - 3, current + 1),
              )
            }
            className="absolute -right-6 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-purple-600 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/90 dark:text-white dark:hover:bg-tournament-dark-muted-hover"
          >
            <IoChevronForward className="h-6 w-6" />
          </button>
        )}

        <div
          className="overflow-hidden"
        >
          <div
            className="flex w-max gap-6 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${translateX}px)` }}
          >
            {desktopItems.map((item, index) => (
              <div
                key={item.id}
                ref={index === 0 ? cardRef : null}
                className="w-[260px] shrink-0 sm:w-[280px] md:w-[300px]"
              >
                <NewsCarouselCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:hidden">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mobileItems.map((item) => (
            <NewsCarouselCard key={item.id} item={item} />
          ))}
        </div>
        {canLoadMore && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() =>
                setMobileVisibleCount((current) =>
                  Math.min(items.length, current + 3),
                )
              }
              className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
            >
              Cargar más
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
