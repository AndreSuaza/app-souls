"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { PublicNewsCard } from "@/interfaces";

type Props = {
  item: PublicNewsCard;
  className?: string;
};

const formatHeroDate = (value?: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

export const NewsHeroCard = ({ item, className }: Props) => {
  const categoryLabel = item.categoryName ?? "Sin categoría";
  const formattedDate = formatHeroDate(item.publishedAt);

  return (
    <Link
      href={`/noticias/${item.id}`}
      className={clsx(
        "group relative grid h-full w-full overflow-hidden rounded-lg border border-tournament-dark-accent bg-white shadow-sm transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface md:grid-cols-[1fr,1fr]",
        className,
      )}
    >
      <div className="relative min-h-[220px] w-full overflow-hidden md:min-h-0">
        <Image
          src={`/news/cards/${item.cardImage}`}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
        <span className="absolute left-4 top-4 inline-flex cursor-default rounded-md bg-purple-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
          {categoryLabel}
        </span>
      </div>

      <div className="flex flex-col justify-center gap-4 px-6 py-8">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
          {formattedDate}
        </span>
        <h2 className="text-xl font-semibold text-slate-900 line-clamp-2 dark:text-white md:text-2xl">
          {item.title}
        </h2>
        <p className="text-base text-slate-600 line-clamp-4 dark:text-slate-300 md:text-lg">
          {item.shortSummary}
        </p>
        <span className="mt-4 inline-flex w-fit items-center justify-center rounded-lg border border-purple-500/70 bg-purple-600 px-6 py-2 text-base font-semibold text-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-purple-400 group-hover:bg-purple-500 group-hover:shadow-lg">
          Leer más
        </span>
      </div>
    </Link>
  );
};
