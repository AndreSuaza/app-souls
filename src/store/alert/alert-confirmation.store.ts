import { create } from "zustand";

interface State {
  isAlertConfirmation: boolean;
  text: string;
  description?: string;
  confirmText?: string;
  confirmPlaceholder?: string;
  action: (() => Promise<boolean>) | null;
  onSuccess?: () => void; // callback éxito
  onError?: () => void; // callback error

  openAlertConfirmation: (params: {
    text: string;
    description?: string;
    confirmText?: string;
    confirmPlaceholder?: string;
    action: () => Promise<boolean>;
    onSuccess?: () => void;
    onError?: () => void;
  }) => void;

  closeAlertConfirmation: () => void;
  runAction: () => Promise<boolean>;
}

export const useAlertConfirmationStore = create<State>()((set, get) => ({
  isAlertConfirmation: false,
  text: "",
  description: undefined,
  confirmText: undefined,
  confirmPlaceholder: undefined,
  action: null,
  onSuccess: undefined,
  onError: undefined,

  openAlertConfirmation: ({
    text,
    description,
    confirmText,
    confirmPlaceholder,
    action,
    onSuccess,
    onError,
  }) =>
    set({
      isAlertConfirmation: true,
      text,
      description,
      confirmText,
      confirmPlaceholder,
      action,
      onSuccess,
      onError,
    }),

  closeAlertConfirmation: () =>
    set({
      isAlertConfirmation: false,
      action: null,
      text: "",
      description: undefined,
      confirmText: undefined,
      confirmPlaceholder: undefined,
      onSuccess: undefined,
      onError: undefined,
    }),

  runAction: async () => {
    const { action, onSuccess, onError } = get();
    if (!action) return false;

    // Cerrar el modal inmediatamente
    set({
      isAlertConfirmation: false,
      action: null,
      text: "",
      description: undefined,
      confirmText: undefined,
      confirmPlaceholder: undefined,
    });

    try {
      const result = await action();

      if (result) {
        onSuccess?.();
      } else {
        onError?.();
      }

      return result;
    } catch {
      onError?.();
      return false;
    } finally {
      // Limpieza final de callbacks
      set({
        onSuccess: undefined,
        onError: undefined,
      });
    }
  },
}));
