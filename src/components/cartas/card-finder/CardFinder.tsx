"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
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

const GRID_CARD_MIN_WIDTH = 160;
// Umbral minimo para permitir una columna cuando el panel esta abierto.
const GRID_CARD_STACK_MIN_WIDTH = 120;
const GRID_GAP_PX = 16;
const PANEL_GAP_PX = 24;

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
  layoutVariant?: "page" | "embedded";
  layoutColumns?: {
    md?: number;
    lg?: number;
    xl?: number;
  };
  layoutColumnsOpen?: {
    lg?: number;
    xl?: number;
  };
  disableUrlSync?: boolean;
  disableGridAnimations?: boolean;
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
  layoutVariant = "page",
  disableUrlSync = false,
  disableGridAnimations = false,
}: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialSelections = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams],
  );
  const initialPaginationFilters = useMemo(
    () => buildPaginationFilters(initialSelections),
    [initialSelections],
  );
  const initialPage = useMemo(() => {
    const pageParam = searchParams.get("page");
    const pageNumber = pageParam ? Number.parseInt(pageParam, 10) : 1;
    if (Number.isNaN(pageNumber) || pageNumber < 1) return 1;
    return pageNumber;
  }, [searchParams]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [cardsState, setCardsState] = useState(cards);
  const [totalPagesState, setTotalPagesState] = useState(totalPage);
  const [advancedCurrentPage, setAdvancedCurrentPage] = useState(
    currentPage ?? initialPage,
  );
  const [advancedFilters, setAdvancedFilters] = useState<PaginationFilters>(
    () => initialPaginationFilters,
  );
  const [advancedSelection, setAdvancedSelection] = useState<FilterSelections>(
    () => initialSelections,
  );
  const [totalCardsState, setTotalCardsState] = useState(
    totalCards ?? cards.length,
  );
  const [perPageState, setPerPageState] = useState(perPage ?? 30);
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  const layoutContainerRef = useRef<HTMLDivElement | null>(null);
  const [autoColumns, setAutoColumns] = useState(1);
  const [isCompactSearchLayout, setIsCompactSearchLayout] = useState(false);
  const [shouldStackPanel, setShouldStackPanel] = useState(false);

  useEffect(() => {
    // Mantiene el comportamiento original en lg+ y evita ocultar filtros alli.
    const media = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => setIsLargeScreen(media.matches);
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

  useEffect(() => {
    const element = gridWrapperRef.current;
    if (!element) return;

    const calculateColumns = (width: number) => {
      const nextColumns = Math.floor(
        (width + GRID_GAP_PX) / (GRID_CARD_MIN_WIDTH + GRID_GAP_PX),
      );
      return Math.max(1, Math.min(8, nextColumns));
    };

    // Ajusta columnas segun el ancho real para que el layout responda al espacio disponible.
    const updateColumns = (width: number) => {
      const nextValue = calculateColumns(width);
      setAutoColumns((prev) => (prev === nextValue ? prev : nextValue));
    };

    updateColumns(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        updateColumns(entry.contentRect.width);
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [layoutVariant, useAdvancedFilters]);

  // Sincroniza filtros con la URL sin disparar navegacion de Next.
  const updateUrlWithFilters = useCallback(
    (selection: FilterSelections, page: number) => {
      if (disableUrlSync) return;
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
    [disableUrlSync, pathname],
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
    [totalCardsState, perPageState],
  );

  const handleAdvancedSearch = useCallback(
    async (filters: PaginationFilters) => {
      setAdvancedFilters(filters);
      await fetchAdvancedCards(filters, 1);
    },
    [fetchAdvancedCards],
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
    ],
  );

  const handleSidebarFiltersChange = useCallback(
    (selection: FilterSelections) => {
      setAdvancedSelection(selection);
      updateUrlWithFilters(selection, 1);
      void handleAdvancedSearch(buildPaginationFilters(selection));
    },
    [handleAdvancedSearch, updateUrlWithFilters],
  );

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

  const isEmbedded = layoutVariant === "embedded";
  const forceDesktopLayout = isEmbedded;
  const isLargeScreenLayout = forceDesktopLayout ? true : isLargeScreen;
  const showMobileToggle = isEmbedded && !isLargeScreenLayout;
  const hideEmbeddedContent = showMobileToggle && filtersCollapsed;
  const stackPanelLayout = panelOpen && shouldStackPanel;
  const shouldShiftGrid = panelOpen && !stackPanelLayout;

  useEffect(() => {
    if (!showMobileToggle && filtersCollapsed) {
      setFiltersCollapsed(false);
    }
  }, [showMobileToggle, filtersCollapsed]);

  useEffect(() => {
    if (!useAdvancedFilters) {
      setShouldStackPanel(false);
      return;
    }

    const element = layoutContainerRef.current;
    if (!element) return;

    // Determina si hay espacio real para mostrar filtros y cartas en la misma fila.
    const updateLayout = (width: number) => {
      const gridWidth = width - (FILTER_PANEL_WIDTH + PANEL_GAP_PX);
      const nextValue = gridWidth < GRID_CARD_STACK_MIN_WIDTH;
      setShouldStackPanel((prev) => (prev === nextValue ? prev : nextValue));
    };

    updateLayout(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        updateLayout(entry.contentRect.width);
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [useAdvancedFilters]);

  const gridContent = (
    <Pagination {...paginationProps}>
      <CardGrid
        cards={cardsSource}
        addCard={addCard}
        addCardSidedeck={addCardSidedeck}
        autoColumns={autoColumns}
        disableAnimations={disableGridAnimations}
      />
    </Pagination>
  );

  const statsRange = useMemo(() => {
    if (!useAdvancedFilters) return undefined;
    return formatStatsRange(
      advancedCurrentPage,
      perPageState || 30,
      totalCardsState,
    );
  }, [advancedCurrentPage, perPageState, totalCardsState, useAdvancedFilters]);

  if (useAdvancedFilters) {
    const advancedContainerClassName = clsx(
      "relative",
      layoutVariant === "embedded"
        ? isCompactSearchLayout
          ? "pl-2 pr-0 pb-6 pt-4 sm:pl-5 sm:pr-0"
          : "px-4 pb-6 pt-4 sm:px-5"
        : "px-4 pb-10 pt-5 sm:px-6 min-h-[100vh] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-tournament-dark-bg dark:via-tournament-dark-muted dark:to-tournament-dark-bg",
    );

    return (
      <div ref={layoutContainerRef} className={advancedContainerClassName}>
        <div className={hideEmbeddedContent ? "hidden" : ""}>
          <CardFiltersSidebar
            propertiesCards={propertiesCards}
            panelOpen={panelOpen}
            onPanelToggle={() => setPanelOpen((value) => !value)}
            onClosePanel={() => setPanelOpen(false)}
            initialFilters={initialSelections}
            onFiltersChange={handleSidebarFiltersChange}
            statsRange={statsRange}
            forceDesktopLayout={forceDesktopLayout}
            onCompactSearchLayoutChange={setIsCompactSearchLayout}
            stackPanelLayout={stackPanelLayout}
          />
        </div>
        {!hideEmbeddedContent && (
          <div className="overflow-hidden">
            <motion.div
              ref={gridWrapperRef}
              animate={{
                x: shouldShiftGrid ? FILTER_PANEL_WIDTH + PANEL_GAP_PX : 0,
              }}
              transition={{ type: "tween", duration: 0.35 }}
              style={
                shouldShiftGrid
                  ? {
                      width: `calc(100% - ${
                        FILTER_PANEL_WIDTH + PANEL_GAP_PX
                      }px)`,
                    }
                  : undefined
              }
            >
              {gridContent}
            </motion.div>
          </div>
        )}
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
      <div ref={gridWrapperRef}>{gridContent}</div>
    </div>
  );
};
