import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  showToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const fallbackMessages: Record<ToastType, string> = {
  success: "Accion completada correctamente.",
  error: "Ocurrio un error. Intentalo nuevamente.",
  warning: "No se pudo completar la accion.",
  info: "No se pudo completar la accion.",
};

const TECHNICAL_ERROR_PATTERNS = [
  /__TURBOPACK__/i,
  /PrismaClient/i,
  /Invalid `.*` invocation/i,
  /The change you are trying/i,
  /\.next/i,
  /node_modules/i,
  /file:\/\//i,
  /\bP20\d{2}\b/i,
  /\bat\s.+:\d+:\d+/i,
];

const sanitizeToastMessage = (message: string, type: ToastType) => {
  const trimmed = message.trim();
  if (!trimmed) return fallbackMessages[type];

  const isTechnicalMessage =
    TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(trimmed)) ||
    (type === "error" && trimmed.length > 240);

  if (isTechnicalMessage) {
    return fallbackMessages[type];
  }

  return trimmed;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  showToast: (message, type) => {
    const id = crypto.randomUUID();
    const safeMessage = sanitizeToastMessage(message, type);

    set((state) => ({
      toasts: [...state.toasts, { id, message: safeMessage, type }],
    }));

    // Autocierre a los 3s
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
