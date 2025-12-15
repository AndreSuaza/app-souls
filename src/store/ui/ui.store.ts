import { create } from "zustand";

interface State {
  // Sidebar público
  isSideMenuOpen: boolean;
  openSideMenu: () => void;
  closeSideMenu: () => void;

  // Sidebar torneos
  isTournamentSidebarOpen: boolean;
  openTournamentSidebar: () => void;
  closeTournamentSidebar: () => void;

  // Loading global
  isLoading: boolean;
  loadingMessage?: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

export const useUIStore = create<State>()((set) => ({
  // Sidebar público
  isSideMenuOpen: false,
  openSideMenu: () => set({ isSideMenuOpen: true }),
  closeSideMenu: () => set({ isSideMenuOpen: false }),

  // Sidebar torneos
  isTournamentSidebarOpen: false,
  openTournamentSidebar: () => set({ isTournamentSidebarOpen: true }),
  closeTournamentSidebar: () => set({ isTournamentSidebarOpen: false }),

  // Loading global
  isLoading: false,
  loadingMessage: undefined,

  showLoading: (message?: string) =>
    set({
      isLoading: true,
      loadingMessage: message,
    }),

  hideLoading: () =>
    set({
      isLoading: false,
      loadingMessage: undefined,
    }),
}));
