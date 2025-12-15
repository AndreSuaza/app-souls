import { create } from 'zustand'

interface State {

    isCardDetailOpen: boolean;
    openCardDetail: () => void;
    closeCardDetail: () => void;
}

export const useCardDetailStore = create<State>()((set) => ({
    isCardDetailOpen: false,
    openCardDetail: () => set({ isCardDetailOpen: true }),
    closeCardDetail: () => set({ isCardDetailOpen: false }),
}));