"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CardFinderLab, Pagination } from "@/components";
import { CardGrid } from "../card-grid/CardGrid";
import { Card } from "@/interfaces";
import { getPaginatedCards } from "@/actions";
import { CardFinderLabLocal } from "../../finders/CardFinderLabLocal";
import { buildPaginationFilters, FilterSelections } from "@/utils/filter-utils";
import type { PaginationFilters } from "@/interfaces";
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [cardsState, setCardsState] = useState(cards);
  const [totalPagesState, setTotalPagesState] = useState(totalPage);
  const [advancedCurrentPage, setAdvancedCurrentPage] = useState(
    currentPage ?? 1
  );
  const [advancedFilters, setAdvancedFilters] = useState<PaginationFilters>({});
  const [totalCardsState, setTotalCardsState] = useState(
    totalCards ?? cards.length
  );
  const [perPageState, setPerPageState] = useState(perPage ?? 30);

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
    },
    [advancedFilters, fetchAdvancedCards]
  );

  const handleSidebarFiltersChange = useCallback(
    (selection: FilterSelections) => {
      void handleAdvancedSearch(buildPaginationFilters(selection));
    },
    [handleAdvancedSearch]
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

  const gridContent = (
    <Pagination {...paginationProps}>
      <CardGrid
        cards={cardsSource}
        addCard={addCard}
        addCardSidedeck={addCardSidedeck}
        columns={columns}
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
          onFiltersChange={handleSidebarFiltersChange}
          statsRange={statsRange}
        />
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: panelOpen ? FILTER_PANEL_WIDTH + 24 : 0 }}
            transition={{ type: "tween", duration: 0.35 }}
            style={{
              width: panelOpen
                ? `calc(100% - ${FILTER_PANEL_WIDTH + 24}px)`
                : "100%",
            }}
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
