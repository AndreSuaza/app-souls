import { create } from "zustand";

interface State {
  isAlertConfirmation: boolean;
  text: string;
  action: (() => Promise<boolean>) | null;

  openAlertConfirmation: (params: {
    text: string;
    action: () => Promise<boolean>;
  }) => void;

  closeAlertConfirmation: () => void;
  runAction: () => Promise<boolean>;
}

export const useAlertConfirmationStore = create<State>()((set, get) => ({
  isAlertConfirmation: false,
  text: "",
  action: null,

  openAlertConfirmation: ({ text, action }) =>
    set({
      isAlertConfirmation: true,
      text,
      action,
    }),

  closeAlertConfirmation: () =>
    set({
      isAlertConfirmation: false,
      action: null,
      text: "",
    }),

  runAction: async () => {
    const fn = get().action;
    if (!fn) return false;

    const result = await fn();

    set({
      isAlertConfirmation: false,
      action: null,
      text: "",
    });

    return result;
  },
}));
