import { create } from "zustand";
import { getTournamentTypesAction } from "@/actions";
import { TypeTournament } from "@/interfaces";

type CatalogState = {
  tournamentTypes: TypeTournament[];
  loading: boolean;
  fetchTournamentTypes: () => Promise<void>;
};

export const useCatalogStore = create<CatalogState>((set) => ({
  tournamentTypes: [],
  loading: false,

  fetchTournamentTypes: async () => {
    set({ loading: true });
    const data = await getTournamentTypesAction();

    set({
      tournamentTypes: data,
      loading: false,
    });
  },
}));
