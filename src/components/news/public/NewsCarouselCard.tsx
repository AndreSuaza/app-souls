"use client";

import Image from "next/image";
import Link from "next/link";
import type { PublicNewsCard } from "@/interfaces";

type Props = {
  item: PublicNewsCard;
};

export const NewsCarouselCard = ({ item }: Props) => {
  const categoryLabel = item.categoryName ?? "Sin categoría";

  return (
    <Link
      href={`/noticias/${item.id}`}
      className="group relative flex w-[240px] shrink-0 flex-col overflow-hidden rounded-2xl border border-tournament-dark-accent bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface sm:w-[280px] md:w-[300px]"
    >
      <div className="relative h-40 w-full overflow-hidden sm:h-44 md:h-48">
        <Image
          src={`/news/${item.featuredImage}`}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 300px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 py-4">
        <span className="inline-flex w-fit cursor-default rounded-full border border-purple-300/70 bg-purple-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-700 dark:border-purple-300/60 dark:bg-purple-300/15 dark:text-purple-100">
          {categoryLabel}
        </span>
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 dark:text-white">
          {item.title}
        </h3>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-end p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="w-full rounded-xl bg-slate-950/80 p-3 text-xs text-slate-100">
          <p className="line-clamp-3">{item.shortSummary}</p>
        </div>
      </div>
    </Link>
  );
};
