"use client";

import { useEffect, useMemo, useState } from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import type { PublicNewsCard } from "@/interfaces";
import { NewsCarouselCard } from "./NewsCarouselCard";

type Props = {
  items: PublicNewsCard[];
};

export const NewsCarousel = ({ items }: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const pages = useMemo(() => {
    const chunkSize = 3;
    const chunked: PublicNewsCard[][] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      chunked.push(items.slice(i, i + chunkSize));
    }

    return chunked;
  }, [items]);

  useEffect(() => {
    if (pageIndex >= pages.length) {
      setPageIndex(0);
    }
  }, [pageIndex, pages.length]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
        No hay noticias recomendadas.
      </div>
    );
  }

  const canScrollLeft = pageIndex > 0;
  const canScrollRight = pageIndex < pages.length - 1;

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Noticias anteriores"
          onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
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
            setPageIndex((current) => Math.min(pages.length - 1, current + 1))
          }
          className="absolute -right-6 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-purple-600 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/90 dark:text-white dark:hover:bg-tournament-dark-muted-hover"
        >
          <IoChevronForward className="h-6 w-6" />
        </button>
      )}

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${pageIndex * 100}%)` }}
        >
          {pages.map((page, index) => (
            <div key={`news-page-${index}`} className="w-full shrink-0">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {page.map((item) => (
                  <NewsCarouselCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
