"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { IoTrashOutline } from "react-icons/io5";
import { PaginationLine } from "@/components/ui";
import { deleteNewsAction } from "@/actions";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import type {
  AdminNewsListItem,
  NewsCategoryOption,
  NewsStatus,
} from "@/interfaces";
import { AdminNewsSearch } from "./AdminNewsSearch";

type Props = {
  news: AdminNewsListItem[];
  categories: NewsCategoryOption[];
  onDeleted?: (id: string) => void;
};

type DateFilter = "all" | "today" | "last7" | "last30" | "last90" | "thisMonth";

const STATUS_OPTIONS: Array<{ value: NewsStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Borrador" },
  { value: "scheduled", label: "Programado" },
  { value: "published", label: "Publicado" },
];

const DATE_OPTIONS: Array<{ value: DateFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "today", label: "Hoy" },
  { value: "last7", label: "Últimos 7 días" },
  { value: "last30", label: "Últimos 30 días" },
  { value: "last90", label: "Últimos 90 días" },
  { value: "thisMonth", label: "Este mes" },
];

const STATUS_STYLES: Record<NewsStatus, { label: string; className: string }> =
  {
    draft: {
      label: "Borrador",
      className:
        "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-tournament-dark-muted dark:text-slate-300 dark:ring-tournament-dark-border",
    },
    scheduled: {
      label: "Programado",
      className:
        "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-500/30",
    },
    published: {
      label: "Publicado",
      className:
        "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-500/30",
    },
  };

const PAGE_SIZE = 10;

export const AdminNewsList = ({ news, categories, onDeleted }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const prevQueryRef = useRef(query);
  const [statusFilter, setStatusFilter] = useState<NewsStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const filtersRef = useRef({
    status: statusFilter,
    category: categoryFilter,
    date: dateFilter,
  });

  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const categoryLookup = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const matchesDate = (value?: string | null) => {
      if (dateFilter === "all") return true;
      if (!value) return false;
      const parsed = new Date(value);
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

    return news.filter((item) => {
      if (term) {
        const matchesTitle = item.title.toLowerCase().includes(term);
        const matchesSubtitle = item.subtitle.toLowerCase().includes(term);
        if (!matchesTitle && !matchesSubtitle) return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== "all" && item.newCategoryId !== categoryFilter) {
        return false;
      }
      // Usa la fecha de publicación si existe, de lo contrario la de creación.
      const dateValue = item.publishedAt ?? item.createdAt;
      if (!matchesDate(dateValue)) return false;

      return true;
    });
  }, [news, query, statusFilter, categoryFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    // Evita filtrar y resetear paginacion en cada tecla.
    const timeoutId = setTimeout(() => {
      setQuery(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  useEffect(() => {
    if (prevQueryRef.current === query) return;
    prevQueryRef.current = query;

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [query, pathname, router, searchParams]);

  useEffect(() => {
    const filtersChanged =
      filtersRef.current.status !== statusFilter ||
      filtersRef.current.category !== categoryFilter ||
      filtersRef.current.date !== dateFilter;

    if (!filtersChanged) return;

    filtersRef.current = {
      status: statusFilter,
      category: categoryFilter,
      date: dateFilter,
    };

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [
    statusFilter,
    categoryFilter,
    dateFilter,
    pathname,
    router,
    searchParams,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set("page", totalPages.toString());
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [currentPage, totalPages, pathname, router, searchParams]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleDelete = (id: string) => {
    openConfirmation({
      text: "¿Deseas eliminar esta noticia?",
      description: "Esta acción no se puede deshacer.",
      action: async () => {
        showLoading("Eliminando noticia...");
        await deleteNewsAction(id);
        hideLoading();
        return true;
      },
      onSuccess: () => {
        showToast("Noticia eliminada", "success");
        onDeleted?.(id);
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo eliminar la noticia", "error");
      },
    });
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/noticias/${id}`);
  };

  return (
    <div className="space-y-6">
      <AdminNewsSearch
        query={inputValue}
        totalCount={filtered.length}
        onChange={setInputValue}
      />

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-[180px] flex-col">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Estado
          </span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as NewsStatus | "all")
            }
            className="mt-1 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 min-w-[200px] flex-col">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Categoría
          </span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="mt-1 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
          >
            <option value="all">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 min-w-[200px] flex-col">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Fecha
          </span>
          <select
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(event.target.value as DateFilter)
            }
            className="mt-1 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
          >
            {DATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-accent dark:bg-tournament-dark-surface dark:text-slate-300">
          No hay noticias para mostrar.
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-xl border border-tournament-dark-accent bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-tournament-dark-border/60 text-xs uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Noticia</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Publicación</th>
                    <th className="px-4 py-3">Autor</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item) => {
                    const authorName =
                      item.authorName ?? item.userId ?? "Sin autor";
                    const categoryName =
                      item.categoryName ??
                      categoryLookup.get(item.newCategoryId) ??
                      "Sin categoría";

                    return (
                      <tr
                        key={item.id}
                        role="button"
                        onClick={() => handleRowClick(item.id)}
                        className="cursor-pointer border-b border-tournament-dark-border/40 text-slate-700 transition hover:bg-slate-50 last:border-b-0 dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.subtitle}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={clsx(
                              "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset",
                              STATUS_STYLES[item.status].className,
                            )}
                          >
                            {STATUS_STYLES[item.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {item.publishedAt
                            ? new Date(item.publishedAt).toLocaleDateString()
                            : "Sin fecha"}
                        </td>
                        <td className="px-4 py-3 text-xs">{authorName}</td>
                        <td className="px-4 py-3 text-xs">{categoryName}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500 text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
                          >
                            <IoTrashOutline size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {paginated.map((item) => {
              const authorName = item.authorName ?? item.userId ?? "Sin autor";
              const categoryName =
                item.categoryName ??
                categoryLookup.get(item.newCategoryId) ??
                "Sin categoría";

              return (
                <div
                  key={item.id}
                  role="button"
                  onClick={() => handleRowClick(item.id)}
                  className="rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm transition hover:bg-slate-50 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:hover:bg-tournament-dark-muted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.subtitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      title="Eliminar"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500 text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={clsx(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset",
                        STATUS_STYLES[item.status].className,
                      )}
                    >
                      {STATUS_STYLES[item.status].label}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString()
                        : "Sin fecha"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <p>Autor: {authorName}</p>
                    <p>Categoría: {categoryName}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <PaginationLine
            totalPages={totalPages}
            currentPage={currentPage}
            pathname={pathname}
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
};
