import { Card } from '@/interfaces';
import { create } from 'zustand'

interface State {

    isCardDetailOpen: boolean;
    openCardDetail: (card:Card) => void;
    closeCardDetail: () => void;
    
}

export const useCardDetailStore = create<State>()((set) => ({
    isCardDetailOpen: false,
    openCardDetail: (card) => set({ isCardDetailOpen: true }),
    closeCardDetail: () => set({ isCardDetailOpen: false }),
}));