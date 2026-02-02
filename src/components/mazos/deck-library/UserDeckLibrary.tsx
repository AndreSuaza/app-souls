"use client";

import { useEffect } from "react";
import type { ArchetypeOption } from "@/interfaces";
import { DeckLibrary } from "./DeckLibrary";
import type { DeckFiltersState } from "../deck-filters/DeckFiltersBar";
import { useUserDecksStore } from "@/store";

interface Props {
  archetypes: ArchetypeOption[];
  hasSession: boolean;
  onSelect?: () => void;
}

export function UserDeckLibrary({ archetypes, hasSession, onSelect }: Props) {
  const {
    decks,
    pagination,
    likedDeckIds,
    filters,
    hasLoaded,
    isLoading,
    ensureLoaded,
    fetchDecks,
  } = useUserDecksStore();

  useEffect(() => {
    void ensureLoaded(hasSession);
  }, [hasSession, ensureLoaded]);

  if (!hasLoaded) {
    return (
      <div className="py-8 text-center text-sm text-slate-600 dark:text-slate-300">
        Cargando mazos...
      </div>
    );
  }

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
      showLikeButton={false}
      getDeckHref={(deck) => `/laboratorio?id=${deck.id}`}
      onDeckSelect={onSelect ? () => onSelect() : undefined}
      isLoading={isLoading}
    />
  );
}
