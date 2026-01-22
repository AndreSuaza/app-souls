"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PaginationLine } from "@/components/ui";
import {
  PublicTournamentsMobileList,
  PublicTournamentsTable,
} from "@/components";
import { AdminTournamentsSearch } from "./AdminTournamentsSearch";
import clsx from "clsx";

type TournamentStatus = "pending" | "in_progress" | "finished" | "cancelled";

export type AdminTournamentListItem = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
  playersCount: number;
  storeName?: string | null;
  typeTournamentName?: string | null;
};

type Props = {
  tournaments: AdminTournamentListItem[];
  showStoreColumn?: boolean;
  isAdmin?: boolean;
  availableTiers?: string[];
  availableStores?: string[];
};

const statusOptions: Array<{ value: TournamentStatus | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En progreso" },
  { value: "finished", label: "Finalizado" },
  { value: "cancelled", label: "Cancelado" },
];

const PAGE_SIZE = 10;

const statusConfig = {
  pending: {
    label: "Pendiente",
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-500/30",
  },
  in_progress: {
    label: "En progreso",
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-500/30",
  },
  finished: {
    label: "Finalizado",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-500/30",
  },
  cancelled: {
    label: "Cancelado",
    className:
      "bg-slate-200 text-slate-600 ring-slate-300 dark:bg-tournament-dark-muted dark:text-slate-400 dark:ring-tournament-dark-accent",
  },
};

export const AdminTournamentsList = ({
  tournaments,
  showStoreColumn = false,
  isAdmin = false,
  availableTiers,
  availableStores,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const prevQueryRef = useRef(query);
  const [tierFilter, setTierFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TournamentStatus>("all");
  const filtersRef = useRef({
    status: statusFilter,
    tier: tierFilter,
    store: storeFilter,
  });

  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const tierOptions = useMemo(() => {
    const values = availableTiers?.length
      ? availableTiers
      : tournaments
          .map((t) => t.typeTournamentName)
          .filter(
            (tier): tier is string =>
              typeof tier === "string" && tier.trim().length > 0
          );
    return Array.from(new Set(values))
      .filter((name) => name.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));
  }, [availableTiers, tournaments]);

  const storeOptions = useMemo(() => {
    const values = availableStores?.length
      ? availableStores
      : tournaments
          .map((t) => t.storeName)
          .filter(
            (store): store is string =>
              typeof store === "string" && store.trim().length > 0
          );
    return Array.from(new Set(values))
      .filter((name) => name.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));
  }, [availableStores, tournaments]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return tournaments.filter((tournament) => {
      if (term && !tournament.title.toLowerCase().includes(term)) return false;
      if (statusFilter !== "all" && tournament.status !== statusFilter)
        return false;
      if (isAdmin && tierFilter !== "all") {
        if ((tournament.typeTournamentName ?? "") !== tierFilter) return false;
      }
      if (isAdmin && storeFilter !== "all") {
        if ((tournament.storeName ?? "") !== storeFilter) return false;
      }
      return true;
    });
  }, [query, tournaments, statusFilter, tierFilter, storeFilter, isAdmin]);

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
      filtersRef.current.tier !== tierFilter ||
      filtersRef.current.store !== storeFilter ||
      filtersRef.current.status !== statusFilter;

    if (!filtersChanged) return;

    filtersRef.current = {
      tier: tierFilter,
      store: storeFilter,
      status: statusFilter,
    };

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [tierFilter, storeFilter, statusFilter, pathname, router, searchParams]);

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

  const displayTournaments = useMemo(
    () =>
      paginated.map((tournament) => ({
        ...tournament,
        tierName: tournament.typeTournamentName ?? undefined,
        storeName: tournament.storeName ?? undefined,
      })),
    [paginated]
  );

  const handleRowClick = (id: string, status: TournamentStatus) => {
    if (status === "cancelled") return;
    router.push(`/admin/torneos/${id}`);
  };

  return (
    <div className="space-y-6">
      <AdminTournamentsSearch
        query={inputValue}
        totalCount={filtered.length}
        onChange={setInputValue}
      />
      <div className="flex flex-wrap gap-3">
        {isAdmin && (
          <div className="flex flex-1 min-w-[180px] flex-col">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tier
            </span>
            <select
              value={tierFilter}
              onChange={(event) => setTierFilter(event.target.value)}
              className="mt-1 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
            >
              <option value="all">Todos los tiers</option>
              {tierOptions.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>
        )}
        {isAdmin && (
          <div className="flex flex-1 min-w-[180px] flex-col">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tienda
            </span>
            <select
              value={storeFilter}
              onChange={(event) => setStoreFilter(event.target.value)}
              className="mt-1 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
            >
              <option value="all">Todas las tiendas</option>
              {storeOptions.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </div>
        )}
        <div
          className={clsx(
            "flex flex-1 min-w-[180px] flex-col",
            !isAdmin && "sm:flex-[0_auto] sm:w-auto"
          )}
        >
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Estado
          </span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | TournamentStatus)
            }
            className={clsx(
              "mt-1 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30",
              !isAdmin && "sm:flex-[0_auto] sm:w-auto sm:max-w-[260px]"
            )}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-accent dark:bg-tournament-dark-surface dark:text-slate-300">
          No hay torneos para mostrar.
        </div>
      ) : (
        <>
          <PublicTournamentsTable
            tournaments={displayTournaments}
            statusConfig={statusConfig}
            showStoreColumn={showStoreColumn}
            showPlayersColumn
            showActionColumn={false}
            showTierColumn={isAdmin}
            onSelect={(tournament) =>
              handleRowClick(tournament.id, tournament.status)
            }
          />

          <PublicTournamentsMobileList
            tournaments={displayTournaments}
            statusConfig={statusConfig}
            showStoreColumn={showStoreColumn}
            showPlayersColumn
            showTierColumn={isAdmin}
            onSelect={(tournament) =>
              handleRowClick(tournament.id, tournament.status)
            }
          />

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
