import { create } from "zustand";
import { getUserDecksFilteredAction } from "@/actions";
import type { Deck, DeckPagination, DeckFilteredResult } from "@/interfaces";
import type { DeckFiltersInput } from "@/schemas";

export type UserDeckFilters = {
  tournament: "all" | "with" | "without";
  date: "recent" | "old";
  archetypeId: string;
  likes: "" | "1";
};

interface State {
  decks: Deck[];
  pagination: DeckPagination;
  likedDeckIds: string[];
  filters: UserDeckFilters;
  isLoading: boolean;
  hasLoaded: boolean;
  ensureLoaded: (hasSession: boolean) => Promise<void>;
  fetchDecks: (input: DeckFiltersInput) => Promise<DeckFilteredResult>;
  setFilters: (filters: UserDeckFilters) => void;
}

const initialFilters: UserDeckFilters = {
  tournament: "all",
  date: "recent",
  archetypeId: "",
  likes: "",
};

const emptyPagination: DeckPagination = {
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  perPage: 16,
};

export const useUserDecksStore = create<State>()((set, get) => ({
  decks: [],
  pagination: emptyPagination,
  likedDeckIds: [],
  filters: initialFilters,
  isLoading: false,
  hasLoaded: false,

  setFilters: (filters) => set({ filters }),

  ensureLoaded: async (hasSession) => {
    if (!hasSession) {
      set({
        decks: [],
        pagination: emptyPagination,
        likedDeckIds: [],
        hasLoaded: true,
        isLoading: false,
      });
      return;
    }

    if (get().hasLoaded) return;
    set({ isLoading: true });
    const result = await getUserDecksFilteredAction({
      tournament: initialFilters.tournament,
      archetypeId: initialFilters.archetypeId,
      date: initialFilters.date,
      likes: false,
      page: 1,
    });
    set({
      decks: result.decks,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        perPage: result.perPage,
      },
      likedDeckIds: result.likedDeckIds,
      hasLoaded: true,
      isLoading: false,
    });
  },

  fetchDecks: async (input) => {
    set({ isLoading: true });
    const result = await getUserDecksFilteredAction(input);
    set({
      decks: result.decks,
      pagination: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        perPage: result.perPage,
      },
      likedDeckIds: result.likedDeckIds,
      isLoading: false,
      hasLoaded: true,
    });
    return result;
  },
}));
