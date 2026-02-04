"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect } from "react";
import type { ArchetypeOption, Deck } from "@/interfaces";
import { DeckLibrary } from "./DeckLibrary";
import type { DeckFiltersState } from "../deck-filters/DeckFiltersBar";
import { useUserDecksStore } from "@/store";

interface Props {
  archetypes: ArchetypeOption[];
  hasSession: boolean;
  onSelect?: (deck: Deck, event: MouseEvent<HTMLAnchorElement>) => void;
  refreshToken?: number;
  onDeleteDeck?: (deckId: string) => void;
  headerContent?: ReactNode;
  renderStatsAction?: (params: {
    totalCount: number;
    isLoading: boolean;
    hasLoaded: boolean;
  }) => ReactNode;
}

export function UserDeckLibrary({
  archetypes,
  hasSession,
  onSelect,
  refreshToken,
  onDeleteDeck,
  headerContent,
  renderStatsAction,
}: Props) {
  const {
    decks,
    pagination,
    likedDeckIds,
    filters,
    hasLoaded,
    isLoading,
    ensureLoaded,
    fetchDecks,
    refreshDecks,
  } = useUserDecksStore();

  useEffect(() => {
    void ensureLoaded(hasSession);
  }, [hasSession, ensureLoaded]);

  useEffect(() => {
    if (!hasSession) return;
    void refreshDecks(hasSession);
  }, [hasSession, refreshDecks, refreshToken]);

  if (!hasLoaded) {
    return (
      <div className="py-8 text-center text-sm text-slate-600 dark:text-slate-300">
        Cargando mazos...
      </div>
    );
  }

  const statsAction = renderStatsAction
    ? renderStatsAction({
        totalCount: pagination.totalCount,
        isLoading,
        hasLoaded,
      })
    : undefined;

  return (
    <DeckLibrary
      initialDecks={decks}
      initialPagination={{
        totalCount: pagination.totalCount,
        totalPages: pagination.totalPages,
        currentPage: pagination.currentPage,
        perPage: pagination.perPage,
      }}
      initialLikedDeckIds={likedDeckIds}
      archetypes={archetypes}
      initialFilters={filters as DeckFiltersState}
      hasSession={hasSession}
      fetchDecksAction={fetchDecks}
      disableUrlSync
      showLikeButton
      disableLikeButton
      hideFilters
      headerContent={headerContent}
      statsAction={statsAction}
      getDeckHref={(deck) => `/laboratorio?id=${deck.id}`}
      onDeckSelect={onSelect}
      showDeleteButton={Boolean(onDeleteDeck)}
      onDeleteDeck={onDeleteDeck}
      isLoading={isLoading}
    />
  );
}
