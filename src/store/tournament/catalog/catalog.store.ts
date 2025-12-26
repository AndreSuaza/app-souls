import { create } from "zustand";
import { getTournamentTypesAction, getStoreOptionsAction } from "@/actions";
import { StoreOption, TypeTournament } from "@/interfaces";

type CatalogState = {
  tournamentTypes: TypeTournament[];
  stores: StoreOption[];
  loading: boolean;
  fetchTournamentTypes: () => Promise<void>;
  fetchStores: () => Promise<void>;
};

export const useCatalogStore = create<CatalogState>((set) => ({
  tournamentTypes: [],
  stores: [],
  loading: false,

  fetchTournamentTypes: async () => {
    set({ loading: true });
    const data = await getTournamentTypesAction();

    set({
      tournamentTypes: data,
      loading: false,
    });
  },

  fetchStores: async () => {
    set({ loading: true });
    const data = await getStoreOptionsAction();

    set({
      stores: data,
      loading: false,
    });
  },
}));
