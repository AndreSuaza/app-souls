"use client";

import { useEffect, useMemo, useState } from "react";
import { IoChevronDown, IoSearchOutline } from "react-icons/io5";
import clsx from "clsx";
import type {
  NewsCategoryOption,
  PublicNewsCard,
  PublicNewsListItem,
} from "@/interfaces";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import { PaginationStats } from "@/components/ui/pagination/PaginationStats";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { NewsCarouselCard } from "./NewsCarouselCard";

type Props = {
  news: PublicNewsListItem[];
  categories: NewsCategoryOption[];
};

type DateFilter = "all" | "today" | "last7" | "last30" | "last90" | "thisMonth";

const DATE_OPTIONS: Array<{ value: DateFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "today", label: "Hoy" },
  { value: "last7", label: "Últimos 7 días" },
  { value: "last30", label: "Últimos 30 días" },
  { value: "last90", label: "Últimos 90 días" },
  { value: "thisMonth", label: "Este mes" },
];

const PAGE_SIZE = 8;
const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

const normalizeText = (value: string) => value.trim().toUpperCase();

const resolveDate = (item: PublicNewsListItem) =>
  new Date(item.publishedAt ?? item.createdAt);

const formatStatsRange = (page: number, perPage: number, total: number) => {
  if (total <= 0) return "0-0 de 0";
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  return `${start}-${end} de ${total}`;
};

const mapToPublicCard = (item: PublicNewsListItem): PublicNewsCard => ({
  id: item.id,
  title: item.title,
  shortSummary: item.shortSummary,
  featuredImage: item.cardImage,
  cardImage: item.cardImage,
  publishedAt: item.publishedAt,
  newCategoryId: item.newCategoryId,
  categoryName: item.categoryName,
});

export const PublicNewsExplorer = ({ news, categories }: Props) => {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const categoryOptions = useMemo(
    () =>
      categories
        .map((item) => ({
          id: item.id,
          name: item.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    [categories],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery(inputValue);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [inputValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategories, dateFilter]);

  const filteredBySearchDate = useMemo(() => {
    const term = normalizeText(query);
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const matchesDate = (value?: string | null, fallback?: string) => {
      if (dateFilter === "all") return true;
      const base = value ?? fallback;
      if (!base) return false;
      const parsed = new Date(base);
      if (Number.isNaN(parsed.getTime())) return false;

      switch (dateFilter) {
        case "today":
          return parsed >= startOfToday;
        case "last7":
          return parsed >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "last30":
          return parsed >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case "last90":
          return parsed >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case "thisMonth":
          return parsed >= startOfMonth;
        default:
          return true;
      }
    };

    return news
      .filter((item) => {
        if (term) {
          const titleMatch = normalizeText(item.title).includes(term);
          const subtitleMatch = normalizeText(item.subtitle).includes(term);
          // Permitimos buscar por tags con coincidencia parcial.
          const tagMatch = (item.tags ?? []).some((tag) =>
            normalizeText(tag).includes(term),
          );

          if (!titleMatch && !subtitleMatch && !tagMatch) {
            return false;
          }
        }

        if (!matchesDate(item.publishedAt, item.createdAt)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => resolveDate(b).getTime() - resolveDate(a).getTime());
  }, [news, query, dateFilter]);

  const filtered = useMemo(() => {
    if (selectedCategories.length === 0) {
      return filteredBySearchDate;
    }
    return filteredBySearchDate.filter((item) =>
      selectedCategories.includes(item.newCategoryId),
    );
  }, [filteredBySearchDate, selectedCategories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // El conteo respeta los filtros activos para mantener coherencia en el panel.
    filtered.forEach((item) => {
      counts[item.newCategoryId] = (counts[item.newCategoryId] ?? 0) + 1;
    });
    return counts;
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const inputClass =
    "w-full rounded-lg border border-tournament-dark-accent bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500";
  const selectClass =
    "mt-1 w-full appearance-none rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 cursor-pointer";
  const selectIconClass =
    "pointer-events-none absolute right-3 top-1/2 -translate-y-[45%] text-slate-400 dark:text-slate-300";

  const statsRange = formatStatsRange(safePage, PAGE_SIZE, filtered.length);

  return (
    <section className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] items-start gap-10">
      <aside className="space-y-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-500 dark:text-purple-300">
            Buscar
          </span>
          <div className="relative mt-1">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={inputValue}
              type="search"
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Buscar por título, subtítulo o tags"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-500 dark:text-purple-300">
            Fecha
          </span>
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value as DateFilter)
              }
              className={clsx(
                selectClass,
                dateFilter !== "all" && "border-purple-600",
              )}
            >
              {DATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <IoChevronDown className={selectIconClass} />
          </div>
        </div>

        <div className="space-y-3 gap-1">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-500 dark:text-purple-300">
            Categorías
          </span>
          <div className="flex flex-col gap-1">
            {categoryOptions.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              const count = categoryCounts[category.id] ?? 0;
              return (
                <label
                  key={category.id}
                  className={clsx(
                    "flex cursor-pointer items-center justify-between rounded-lg border border-transparent px-2 py-2 text-sm text-slate-700 transition hover:border-purple-300 dark:text-slate-200",
                    isSelected && "border-purple-400 text-purple-600",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    {category.name}
                  </span>
                  <span className="min-w-[36px] rounded-full bg-purple-100 px-2 py-0.5 text-center text-xs font-semibold text-purple-700 dark:bg-purple-300/20 dark:text-purple-200">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="relative md:pt-7">
        <div className="absolute right-0 -top-2">
          <PaginationStats rangeText={statsRange} entityLabel="noticias" />
        </div>

        <div className="space-y-6">
          {paginated.length === 0 ? (
            <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
              No se encontraron noticias con esos filtros.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((item) => (
                <NewsCarouselCard key={item.id} item={mapToPublicCard(item)} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <PaginationLine
              currentPage={safePage}
              totalPages={totalPages}
              searchParams={EMPTY_SEARCH_PARAMS}
              pathname=""
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </section>
  );
};
