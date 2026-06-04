"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { IoSearchOutline, IoTrashOutline } from "react-icons/io5";
import { deleteEventAction } from "@/actions/events/delete-event.action";
import type { AdminEventListItem, EventStatus } from "@/interfaces/events.interface";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";

type Props = {
  events: AdminEventListItem[];
  onDeleted?: (id: string) => void;
};

type DateFilter = "all" | "upcoming" | "past" | "today" | "thisMonth";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: Array<{
  value: Exclude<EventStatus, "deleted"> | "all";
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Borrador" },
  { value: "scheduled", label: "Programado" },
  { value: "published", label: "Publicado" },
];

const DATE_OPTIONS: Array<{ value: DateFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "upcoming", label: "Próximas" },
  { value: "past", label: "Pasadas" },
  { value: "today", label: "Hoy" },
  { value: "thisMonth", label: "Este mes" },
];

const STATUS_STYLES: Record<EventStatus, { label: string; className: string }> =
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
    deleted: {
      label: "Eliminado",
      className:
        "bg-red-50 text-red-600 ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-500/30",
    },
  };

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const AdminEventsList = ({ events, onDeleted }: Props) => {
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
  const [statusFilter, setStatusFilter] = useState<
    Exclude<EventStatus, "deleted"> | "all"
  >("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const prevQueryRef = useRef(query);
  const filtersRef = useRef({ status: statusFilter, date: dateFilter });

  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const matchesDate = (value: string) => {
      if (dateFilter === "all") return true;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return false;

      switch (dateFilter) {
        case "upcoming":
          return parsed >= now;
        case "past":
          return parsed < now;
        case "today":
          return parsed >= startOfToday && parsed < endOfToday;
        case "thisMonth":
          return parsed >= startOfMonth && parsed < endOfMonth;
        default:
          return true;
      }
    };

    return events.filter((event) => {
      if (event.status === "deleted") return false;
      if (statusFilter !== "all" && event.status !== statusFilter) {
        return false;
      }
      if (!matchesDate(event.startsAt)) return false;
      if (!term) return true;

      return [event.title, event.subtitle, event.badgeLabel]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term));
    });
  }, [events, query, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
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
      filtersRef.current.date !== dateFilter;

    if (!filtersChanged) return;

    filtersRef.current = { status: statusFilter, date: dateFilter };
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [statusFilter, dateFilter, pathname, router, searchParams]);

  useEffect(() => {
    if (currentPage <= totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", totalPages.toString());
    router.replace(`${pathname}?${params.toString()}`);
  }, [currentPage, totalPages, pathname, router, searchParams]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleDelete = (id: string) => {
    openConfirmation({
      text: "¿Deseas eliminar este evento?",
      description: "Esta acción no se puede deshacer.",
      action: async () => {
        showLoading("Eliminando evento...");
        await deleteEventAction(id);
        hideLoading();
        return true;
      },
      onSuccess: () => {
        showToast("Evento eliminado", "success");
        onDeleted?.(id);
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo eliminar el evento", "error");
      },
    });
  };

  const handleRowClick = (slug: string) => {
    router.push(`/admin/eventos/${slug}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            value={inputValue}
            type="search"
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Buscar por titulo, subtitulo o etiqueta"
            className="w-full rounded-lg border border-tournament-dark-accent bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {filtered.length} evento{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex min-w-[180px] flex-1 flex-col">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Estado
          </span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as Exclude<EventStatus, "deleted"> | "all",
              )
            }
            className="mt-1 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-[180px] flex-1 flex-col">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Fecha
          </span>
          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value as DateFilter)}
            className="mt-1 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white"
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
          No hay eventos para mostrar.
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-tournament-dark-accent bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-tournament-dark-border/60 text-xs uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Evento</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Inicio</th>
                    <th className="px-4 py-3">Etiqueta</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((event) => (
                    <tr
                      key={event.id}
                      role="button"
                      onClick={() => handleRowClick(event.slug)}
                      className="cursor-pointer border-b border-tournament-dark-border/40 text-slate-700 transition hover:bg-slate-50 last:border-b-0 dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {event.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {event.subtitle}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset",
                            STATUS_STYLES[event.status].className,
                          )}
                        >
                          {STATUS_STYLES[event.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {formatDate(event.startsAt)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {event.badgeLabel ?? "Sin etiqueta"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          title="Eliminar"
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation();
                            handleDelete(event.id);
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500 text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {paginated.map((event) => (
              <div
                key={event.id}
                role="button"
                onClick={() => handleRowClick(event.slug)}
                className="rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm transition hover:bg-slate-50 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:hover:bg-tournament-dark-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {event.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {event.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    title="Eliminar"
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      handleDelete(event.id);
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
                      STATUS_STYLES[event.status].className,
                    )}
                  >
                    {STATUS_STYLES[event.status].label}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatDate(event.startsAt)}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <p>Etiqueta: {event.badgeLabel ?? "Sin etiqueta"}</p>
                </div>
              </div>
            ))}
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
