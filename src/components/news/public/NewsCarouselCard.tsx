"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { IoArrowForwardOutline } from "react-icons/io5";
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
        "group relative grid min-h-[440px] w-full grid-rows-[1fr,1fr] overflow-hidden rounded-lg border border-tournament-dark-accent bg-white shadow-sm transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface",
        className,
      )}
    >
      <div className={clsx("relative w-full overflow-hidden", imageClassName)}>
        <Image
          src={`/news/cards/${item.cardImage}`}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
        <span className="absolute left-3 top-3 inline-flex cursor-default rounded-md bg-purple-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
          {categoryLabel}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {formattedDate}
        </span>
        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 dark:text-white md:text-lg">
          {item.title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-3 dark:text-slate-300">
          {item.shortSummary}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-purple-600 dark:text-purple-300">
          Leer más
          <IoArrowForwardOutline className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};
