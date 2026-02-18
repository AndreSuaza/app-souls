"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";
import { usePathname, useSearchParams } from "next/navigation";
import { IoCreateOutline, IoTrashOutline } from "react-icons/io5";
import { PaginationLine } from "@/components/ui";
import { deleteNewsAction } from "@/actions";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import type {
  AdminNewsListItem,
  NewsCategoryOption,
  NewsStatus,
} from "@/interfaces";

type Props = {
  news: AdminNewsListItem[];
  categories: NewsCategoryOption[];
  onDeleted?: (id: string) => void;
};

const STATUS_OPTIONS: Array<{ value: NewsStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Borrador" },
  { value: "scheduled", label: "Programado" },
  { value: "published", label: "Publicado" },
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<NewsStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter, categoryFilter]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
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
      return true;
    });
  }, [news, query, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Buscar
          </label>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título o subtítulo"
            className="w-full min-w-[260px] rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
          />
        </div>

        <Link
          href="/admin/noticias/crear-noticia"
          className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          Crear noticia
        </Link>
      </div>

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
      </div>

      <div className="rounded-xl border border-tournament-dark-accent bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
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
              {paginated.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-tournament-dark-border/40 text-slate-700 dark:text-slate-200"
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
                      ? new Date(item.publishedAt).toLocaleString()
                      : "Sin fecha"}
                  </td>
                  <td className="px-4 py-3 text-xs">{item.userId}</td>
                  <td className="px-4 py-3 text-xs">{item.newCategoryId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/noticias/${item.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-500 px-2 py-1 text-xs font-semibold text-purple-600 transition hover:bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-500/10"
                      >
                        <IoCreateOutline size={14} />
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
                      >
                        <IoTrashOutline size={14} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No se encontraron noticias con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>
          Mostrando {paginated.length} de {filtered.length} noticias
        </span>
        {totalPages > 1 && (
          <PaginationLine
            totalPages={totalPages}
            currentPage={currentPage}
            searchParams={searchParams}
            pathname={pathname}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};
