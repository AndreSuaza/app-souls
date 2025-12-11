import { create } from "zustand";

interface State {
  isSideMenuOpen: boolean;
  openSideMenu: () => void;
  closeSideMenu: () => void;

  // Loading global
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

export const useUIStore = create<State>()((set) => ({
  isSideMenuOpen: false,
  openSideMenu: () => set({ isSideMenuOpen: true }),
  closeSideMenu: () => set({ isSideMenuOpen: false }),

  // Loading global
  isLoading: false,
  showLoading: () => set({ isLoading: true }),
  hideLoading: () => set({ isLoading: false }),
}));
