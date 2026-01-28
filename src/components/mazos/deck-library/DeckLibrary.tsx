"use client";

import { getDecksFilteredAction } from "@/actions";
import type { ArchetypeOption, Deck, DeckPagination } from "@/interfaces";
import { Pagination } from "@/components/ui/pagination/pagination";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { DeckCard } from "../deck-card/DeckCard";
import {
  DeckFiltersBar,
  type DeckFiltersState,
} from "../deck-filters/DeckFiltersBar";

interface Props {
  initialDecks: Deck[];
  initialPagination: DeckPagination;
  archetypes: ArchetypeOption[];
  initialFilters: DeckFiltersState;
  hasSession: boolean;
}

const FILTER_KEYS = [
  "tournament",
  "archetype",
  "date",
  "likes",
  "page",
] as const;
const GRID_CARD_MIN_WIDTH = 200;
const GRID_GAP_PX = 16;

const parseFiltersFromUrl = (params: URLSearchParams): DeckFiltersState => {
  const tournamentParam = params.get("tournament");
  const dateParam = params.get("date");
  const likesParam = params.get("likes");
  const archetypeParam = params.get("archetype") ?? "";

  const tournament: DeckFiltersState["tournament"] =
    tournamentParam === "with" || tournamentParam === "without"
      ? tournamentParam
      : "all";

  const date: DeckFiltersState["date"] = dateParam === "old" ? "old" : "recent";

  return {
    tournament,
    date,
    archetypeId: archetypeParam,
    likes: likesParam === "1" ? "1" : "",
  };
};

const parsePageFromUrl = (params: URLSearchParams): number => {
  const pageParam = Number(params.get("page") ?? 1);
  if (Number.isNaN(pageParam) || pageParam < 1) return 1;
  return Math.floor(pageParam);
};

const formatStatsRange = (page: number, perPage: number, total: number) => {
  if (total <= 0) return "0-0";
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  return `${start}-${end}`;
};

export function DeckLibrary({
  initialDecks,
  initialPagination,
  archetypes,
  initialFilters,
  hasSession,
}: Props) {
  const pathname = usePathname();
  const [decks, setDecks] = useState(initialDecks);
  const [filters, setFilters] = useState<DeckFiltersState>(initialFilters);
  const [totalCount, setTotalCount] = useState(initialPagination.totalCount);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);
  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage);
  const [perPage, setPerPage] = useState(initialPagination.perPage);
  const [isPending, startTransition] = useTransition();
  const requestIdRef = useRef(0);
  const gridRef = useRef<HTMLUListElement | null>(null);
  const autoColumnsRef = useRef<number | null>(null);
  const [autoColumns, setAutoColumns] = useState(1);

  useEffect(() => {
    setDecks(initialDecks);
    setFilters(initialFilters);
    setTotalCount(initialPagination.totalCount);
    setTotalPages(initialPagination.totalPages);
    setCurrentPage(initialPagination.currentPage);
    setPerPage(initialPagination.perPage);
  }, [initialDecks, initialFilters, initialPagination]);

  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    const calculateColumns = (width: number) => {
      const nextColumns = Math.floor(
        (width + GRID_GAP_PX) / (GRID_CARD_MIN_WIDTH + GRID_GAP_PX),
      );
      return Math.max(1, Math.min(8, nextColumns));
    };

    // Calcula columnas segun el ancho real para mantener el comportamiento del grid de cartas.
    const updateColumns = (width: number) => {
      const nextValue = calculateColumns(width);
      if (autoColumnsRef.current !== nextValue) {
        autoColumnsRef.current = nextValue;
        setAutoColumns(nextValue);
      }
    };

    let frameId: number | null = null;
    let pendingWidth = element.getBoundingClientRect().width;

    const requestUpdate = (width: number) => {
      pendingWidth = width;
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateColumns(pendingWidth);
      });
    };

    requestUpdate(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        requestUpdate(entry.contentRect.width);
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  const updateUrlWithState = useCallback(
    (nextFilters: DeckFiltersState, page: number) => {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);

      FILTER_KEYS.forEach((key) => params.delete(key));

      if (nextFilters.tournament !== "all") {
        params.set("tournament", nextFilters.tournament);
      }

      if (nextFilters.archetypeId) {
        params.set("archetype", nextFilters.archetypeId);
      }

      if (nextFilters.date !== "recent") {
        params.set("date", nextFilters.date);
      }

      if (nextFilters.likes === "1") {
        params.set("likes", "1");
      }

      if (page > 1) {
        params.set("page", page.toString());
      }

      const query = params.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname;
      window.history.replaceState(null, "", nextUrl);
    },
    [pathname],
  );

  const fetchDecks = useCallback(
    (nextFilters: DeckFiltersState, page: number) => {
      const nextRequestId = requestIdRef.current + 1;
      requestIdRef.current = nextRequestId;

      startTransition(async () => {
        const result = await getDecksFilteredAction({
          tournament: nextFilters.tournament,
          archetypeId: nextFilters.archetypeId || undefined,
          date: nextFilters.date,
          likes: nextFilters.likes === "1",
          page,
        });

        // Evita que respuestas viejas pisen un filtro mas reciente.
        if (requestIdRef.current !== nextRequestId) return;
        setDecks(result.decks);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
        setCurrentPage(result.currentPage);
        setPerPage(result.perPage);
      });
    },
    [],
  );

  const handleFiltersChange = useCallback(
    (nextFilters: DeckFiltersState) => {
      const nextPage = 1;
      setFilters(nextFilters);
      setCurrentPage(nextPage);
      updateUrlWithState(nextFilters, nextPage);
      fetchDecks(nextFilters, nextPage);
    },
    [fetchDecks, updateUrlWithState],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const nextPage = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(nextPage);
      updateUrlWithState(filters, nextPage);
      fetchDecks(filters, nextPage);
    },
    [fetchDecks, filters, totalPages, updateUrlWithState],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nextFilters = parseFiltersFromUrl(params);
      const nextPage = parsePageFromUrl(params);
      setFilters(nextFilters);
      setCurrentPage(nextPage);
      fetchDecks(nextFilters, nextPage);
    };

    // Mantiene filtros/datos sincronizados al navegar con back/forward.
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [fetchDecks]);

  const statsRangeText = useMemo(() => {
    const range = formatStatsRange(currentPage, perPage, totalCount);
    return `${range} de ${totalCount}`;
  }, [currentPage, perPage, totalCount]);

  const emptyState = useMemo(
    () => (
      <div className="rounded-lg border border-slate-200 bg-white/70 p-6 text-sm text-slate-600 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70 dark:text-slate-300">
        No hay mazos que coincidan con los filtros actuales.
      </div>
    ),
    [],
  );

  return (
    <div className="space-y-6">
      <DeckFiltersBar
        archetypes={archetypes}
        filters={filters}
        onChange={handleFiltersChange}
        isLoading={isPending}
        statsRangeText={statsRangeText}
      />

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      >
        <section>
          {decks.length === 0 ? (
            emptyState
          ) : (
            <ul
              ref={gridRef}
              className="grid gap-3 justify-center sm:justify-normal"
              style={{
                gridTemplateColumns: `repeat(${autoColumns}, minmax(0, 1fr))`,
              }}
            >
              {decks.map((deck) => (
                <li key={deck.id} className="h-full">
                  <DeckCard mazo={deck} hasSession={hasSession} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </Pagination>
    </div>
  );
}
