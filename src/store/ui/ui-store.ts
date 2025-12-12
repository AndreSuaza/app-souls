import { create } from "zustand";

interface State {
  isSideMenuOpen: boolean;
  openSideMenu: () => void;
  closeSideMenu: () => void;

  // Loading global
  isLoading: boolean;
  loadingMessage?: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

export const useUIStore = create<State>()((set) => ({
  isSideMenuOpen: false,
  openSideMenu: () => set({ isSideMenuOpen: true }),
  closeSideMenu: () => set({ isSideMenuOpen: false }),

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
