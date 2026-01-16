"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CardFinderLab, Pagination } from "@/components";
import { Card, PaginationFilters, FilterSelections } from "@/interfaces";
import { getPaginatedCards } from "@/actions";
import {
  buildFilterQuery,
  buildPaginationFilters,
  parseFiltersFromSearchParams,
} from "@/utils/filter-utils";
import { CardGrid } from "../card-grid/CardGrid";
import { CardFinderLabLocal } from "../../finders/CardFinderLabLocal";
import {
  CardFiltersSidebar,
  FILTER_PANEL_WIDTH,
} from "../filters/CardFiltersSidebar";

const formatStatsRange = (page: number, perPage: number, total: number) => {
  if (total <= 0) return "0-0 de 0";
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  return `${start}-${end} de ${total}`;
};

//Mover a interface

interface Propertie {
  id: string;
  name: string;
}

interface Properties {
  products: Propertie[];
  types: Propertie[];
  archetypes: Propertie[];
  keywords: Propertie[];
  rarities: Propertie[];
}

interface Props {
  cards: Card[];
  propertiesCards: Properties;
  totalPage: number;
  totalCards?: number;
  perPage?: number;
  cols?: number;
  addCard?: (c: Card) => void;
  addCardSidedeck?: (c: Card) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (filters: PaginationFilters) => void;
  useAdvancedFilters?: boolean;
}

export const CardFinder = ({
  cards,
  propertiesCards,
  totalPage,
  totalCards,
  perPage,
  cols = 6,
  addCard,
  addCardSidedeck,
  currentPage,
  onPageChange,
  onSearch,
  useAdvancedFilters = false,
}: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialSelections = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams]
  );
  const initialPaginationFilters = useMemo(
    () => buildPaginationFilters(initialSelections),
    [initialSelections]
  );
  const initialPage = useMemo(() => {
    const pageParam = searchParams.get("page");
    const pageNumber = pageParam ? Number.parseInt(pageParam, 10) : 1;
    if (Number.isNaN(pageNumber) || pageNumber < 1) return 1;
    return pageNumber;
  }, [searchParams]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [cardsState, setCardsState] = useState(cards);
  const [totalPagesState, setTotalPagesState] = useState(totalPage);
  const [advancedCurrentPage, setAdvancedCurrentPage] = useState(
    currentPage ?? initialPage
  );
  const [advancedFilters, setAdvancedFilters] = useState<PaginationFilters>(
    () => initialPaginationFilters
  );
  const [advancedSelection, setAdvancedSelection] = useState<FilterSelections>(
    () => initialSelections
  );
  const [totalCardsState, setTotalCardsState] = useState(
    totalCards ?? cards.length
  );
  const [perPageState, setPerPageState] = useState(perPage ?? 30);

  useEffect(() => {
    // Detecta viewport md+ para mantener el layout actual en pantallas grandes.
    const media = window.matchMedia("(min-width: 768px)");
    const handleChange = () => setIsDesktop(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!useAdvancedFilters) return;
    setAdvancedSelection(initialSelections);
    setAdvancedFilters(initialPaginationFilters);
    setAdvancedCurrentPage(currentPage ?? initialPage);
  }, [
    useAdvancedFilters,
    initialSelections,
    initialPaginationFilters,
    initialPage,
    currentPage,
  ]);

  // Sincroniza filtros con la URL sin disparar navegacion de Next.
  const updateUrlWithFilters = useCallback(
    (selection: FilterSelections, page: number) => {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);
      const managedKeys = [
        "text",
        "products",
        "types",
        "archetypes",
        "keywords",
        "rarities",
        "costs",
        "forces",
        "defenses",
        "limit",
        "page",
      ];

      managedKeys.forEach((key) => params.delete(key));

      const filterParams = new URLSearchParams(buildFilterQuery(selection));
      for (const [key, value] of filterParams.entries()) {
        params.set(key, value);
      }

      if (page > 1) {
        params.set("page", page.toString());
      }

      const query = params.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname;
      window.history.replaceState(null, "", nextUrl);
    },
    [pathname]
  );

  const fetchAdvancedCards = useCallback(
    async (filters: PaginationFilters, page: number) => {
      const result = await getPaginatedCards({
        page,
        ...filters,
      });

      setCardsState(result.cards);
      setTotalPagesState(result.totalPage);
      setAdvancedCurrentPage(result.currentPage ?? page);
      setTotalCardsState(result.totalCount ?? totalCardsState);
      setPerPageState(result.perPage ?? perPageState);
    },
    [totalCardsState, perPageState]
  );

  const handleAdvancedSearch = useCallback(
    async (filters: PaginationFilters) => {
      setAdvancedFilters(filters);
      await fetchAdvancedCards(filters, 1);
    },
    [fetchAdvancedCards]
  );

  const handleAdvancedPageChange = useCallback(
    async (page: number) => {
      await fetchAdvancedCards(advancedFilters, page);
      updateUrlWithFilters(advancedSelection, page);
    },
    [
      advancedFilters,
      fetchAdvancedCards,
      updateUrlWithFilters,
      advancedSelection,
    ]
  );

  const handleSidebarFiltersChange = useCallback(
    (selection: FilterSelections) => {
      setAdvancedSelection(selection);
      updateUrlWithFilters(selection, 1);
      void handleAdvancedSearch(buildPaginationFilters(selection));
    },
    [handleAdvancedSearch, updateUrlWithFilters]
  );

  const columns = useMemo(() => {
    if (useAdvancedFilters) {
      return panelOpen ? 4 : 6;
    }
    return cols;
  }, [panelOpen, useAdvancedFilters, cols]);

  const cardsSource = useAdvancedFilters ? cardsState : cards;
  const paginationProps = useAdvancedFilters
    ? {
        totalPages: totalPagesState,
        currentPage: advancedCurrentPage,
        onPageChange: handleAdvancedPageChange,
      }
    : {
        totalPages: totalPage,
        currentPage,
        onPageChange,
      };

  const mdColumnsValue = useAdvancedFilters ? (panelOpen ? 2 : 4) : 4;
  const lgColumnsValue = useAdvancedFilters ? (panelOpen ? 4 : 6) : columns;
  const xlColumnsValue = useAdvancedFilters
    ? panelOpen
      ? 6
      : 8
    : Math.max(columns, 8);

  const gridContent = (
    <Pagination {...paginationProps}>
      <CardGrid
        cards={cardsSource}
        addCard={addCard}
        addCardSidedeck={addCardSidedeck}
        smColumns={2}
        mdColumns={mdColumnsValue}
        lgColumns={lgColumnsValue}
        xlColumns={xlColumnsValue}
      />
    </Pagination>
  );

  const statsRange = useMemo(() => {
    if (!useAdvancedFilters) return undefined;
    return formatStatsRange(
      advancedCurrentPage,
      perPageState || 30,
      totalCardsState
    );
  }, [advancedCurrentPage, perPageState, totalCardsState, useAdvancedFilters]);

  if (useAdvancedFilters) {
    return (
      <div className="relative px-4 pb-10 pt-6 sm:px-6 min-h-[100vh] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-tournament-dark-bg dark:via-tournament-dark-muted dark:to-tournament-dark-bg">
        <CardFiltersSidebar
          propertiesCards={propertiesCards}
          panelOpen={panelOpen}
          onPanelToggle={() => setPanelOpen((value) => !value)}
          onClosePanel={() => setPanelOpen(false)}
          initialFilters={initialSelections}
          onFiltersChange={handleSidebarFiltersChange}
          statsRange={statsRange}
        />
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: panelOpen && isDesktop ? FILTER_PANEL_WIDTH + 24 : 0 }}
            transition={{ type: "tween", duration: 0.35 }}
            style={
              panelOpen && isDesktop
                ? { width: `calc(100% - ${FILTER_PANEL_WIDTH + 24}px)` }
                : undefined
            }
          >
            {gridContent}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 lg:p-20">
      {onSearch ? (
        <CardFinderLabLocal
          propertiesCards={propertiesCards}
          cols={cols}
          onSearch={onSearch}
        />
      ) : (
        <CardFinderLab propertiesCards={propertiesCards} cols={cols} />
      )}
      {gridContent}
    </div>
  );
};
