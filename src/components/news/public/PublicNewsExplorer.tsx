"use client";

import { useEffect, useMemo, useState } from "react";
import { IoChevronDown, IoSearchOutline } from "react-icons/io5";
import clsx from "clsx";
import type { NewsCategoryOption, PublicNewsListItem } from "@/interfaces";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { PublicNewsRowCard } from "./PublicNewsRowCard";

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

const PAGE_SIZE = 6;
const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

const normalizeText = (value: string) => value.trim().toUpperCase();

const resolveDate = (item: PublicNewsListItem) =>
  new Date(item.publishedAt ?? item.createdAt);

export const PublicNewsExplorer = ({ news, categories }: Props) => {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const categoryOptions = useMemo(
    () =>
      categories.map((item) => ({
        id: item.id,
        name: item.name,
      })),
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
  }, [query, categoryFilter, dateFilter]);

  const filtered = useMemo(() => {
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
        if (categoryFilter !== "all" && item.newCategoryId !== categoryFilter) {
          return false;
        }

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
  }, [news, query, categoryFilter, dateFilter]);

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

  const labelClass = "text-xs font-semibold text-slate-500 dark:text-slate-400";
  const selectClass =
    "mt-1 w-full lg:w-auto min-w-0 lg:min-w-[200px] max-w-full appearance-none rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 cursor-pointer";
  const selectIconClass =
    "pointer-events-none absolute right-3 top-1/2 -translate-y-[45%] text-slate-400 dark:text-slate-300";

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex w-full min-w-0 flex-col">
          <span className={labelClass}>Buscar</span>
          <div className="relative mt-1">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={inputValue}
              type="search"
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Buscar por título, subtítulo o tags"
              className="w-full rounded-lg border border-tournament-dark-accent bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:items-end">
          <div className="flex w-full min-w-0 flex-col">
            <span className={labelClass}>Categoría</span>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className={clsx(
                  selectClass,
                  categoryFilter !== "all" && "border-purple-600",
                )}
              >
                <option value="all">Todas</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <IoChevronDown className={selectIconClass} />
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col">
            <span className={labelClass}>Fecha</span>
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
        </div>
      </div>

      <div className="space-y-4">
        {paginated.length === 0 ? (
          <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
            No se encontraron noticias con esos filtros.
          </div>
        ) : (
          paginated.map((item) => (
            <PublicNewsRowCard key={item.id} item={item} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <PaginationLine
          currentPage={safePage}
          totalPages={totalPages}
          searchParams={EMPTY_SEARCH_PARAMS}
          pathname=""
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
};
