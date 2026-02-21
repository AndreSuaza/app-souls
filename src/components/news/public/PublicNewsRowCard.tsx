"use client";

import Image from "next/image";
import Link from "next/link";
import type { PublicNewsListItem } from "@/interfaces";

type Props = {
  item: PublicNewsListItem;
};

const formatNewsDate = (value?: string | null, fallback?: string) => {
  const base = value ?? fallback;
  if (!base) return "";
  const date = new Date(base);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const PublicNewsRowCard = ({ item }: Props) => {
  const categoryLabel = item.categoryName ?? "Sin categoría";
  const formattedDate = formatNewsDate(item.publishedAt, item.createdAt);

  return (
    <Link
      href={`/noticias/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-tournament-dark-accent bg-white shadow-sm transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface md:flex-row"
    >
      <div className="relative h-[200px] w-full md:h-full md:min-h-[220px] md:w-1/3">
        <Image
          src={`/news/cards/${item.cardImage}`}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        <span className="inline-flex w-fit cursor-default rounded-md bg-purple-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
          {categoryLabel}
        </span>
        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 dark:text-white md:text-lg">
          {item.title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-3 dark:text-slate-300">
          {item.shortSummary}
        </p>
        <span className="mt-auto pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {formattedDate}
        </span>
      </div>
    </Link>
  );
};
