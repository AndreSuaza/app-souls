import { create } from "zustand";

interface State {
  isAlertConfirmation: boolean;
  openAlertConfirmation: () => void;
  closeAlertConfirmation: () => void;
  action: (() => Promise<boolean>) | null;
  setAction: (fn: () => Promise<boolean>) => void;
  runAction: () => Promise<boolean>;
}

export const useAlertConfirmationStore = create<State>()((set, get) => ({
  isAlertConfirmation: false,
  openAlertConfirmation: () => set({ isAlertConfirmation: true }),
  closeAlertConfirmation: () => set({ isAlertConfirmation: false }),
  action: null,
  setAction: (fn) => set({ action: fn }),
  runAction: async () => {
    const fn = get().action;
    if (!fn) return false;

    const result = await fn();

    set({ isAlertConfirmation: false });

    return result;
  },
}));
