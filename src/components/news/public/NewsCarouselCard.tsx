"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { PublicNewsCard } from "@/interfaces";

type Props = {
  item: PublicNewsCard;
  className?: string;
  imageClassName?: string;
};

export const NewsCarouselCard = ({
  item,
  className,
  imageClassName,
}: Props) => {
  const categoryLabel = item.categoryName ?? "Sin categoría";
  const formattedDate = item.publishedAt
    ? new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(item.publishedAt))
    : "";

  return (
    <Link
      href={`/noticias/${item.id}`}
      className={clsx(
        "group relative flex w-full min-h-[440px] flex-col overflow-hidden rounded-2xl border border-tournament-dark-accent bg-white shadow-sm transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface",
        className,
      )}
    >
      <div
        className={clsx(
          "relative h-48 w-full overflow-hidden sm:h-52 md:h-56",
          imageClassName,
        )}
      >
        <Image
          src={`/news/cards/${item.cardImage}`}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
        <span className="absolute bottom-3 left-3 inline-flex cursor-default rounded-md bg-purple-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
          {categoryLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 dark:text-white md:text-lg">
          {item.title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-3 dark:text-slate-300">
          {item.shortSummary}
        </p>
        <span className="mt-auto pt-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {formattedDate}
        </span>
      </div>
    </Link>
  );
};
