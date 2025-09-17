import { create } from 'zustand'

interface State {

    isAlertConfirmation: boolean;
    openAlertConfirmation: () => void;
    closeAlertConfirmation: () => void;
    action: (() => void) | null;   
    setAction: (fn: () => void) => void;
    runAction: () => void;
}

export const useAlertConfirmationStore = create<State>()((set, get) => ({
    isAlertConfirmation: false,
    openAlertConfirmation: () => set({ isAlertConfirmation: true }),
    closeAlertConfirmation: () => set({ isAlertConfirmation: false }),
    action: null,
    setAction: (fn) => set({ action: fn }),
    runAction: () => {
        const fn = get().action;
        if (fn) fn();   
        set({ isAlertConfirmation: false });
    },
}));

