import { Card } from '@/interfaces';
import { create } from 'zustand'

interface State {

    isCardDetailOpen: boolean;
    isListCards: Card[];
    isIndex: number;
    isDeck: Card[];
    openCardDetail: () => void;
    closeCardDetail: () => void;
    setListDetail: (list: Card[]) => void;
    setIndexDetail: (index: number) => void;
    setDeckDetail: (list: Card[]) => void;
}

export const useCardDetailStore = create<State>()((set) => ({
    isCardDetailOpen: false,
    isListCards: [],
    isIndex: 0,
    isDeck: [],
    openCardDetail: () => set({ isCardDetailOpen: true }),
    closeCardDetail: () => set({ isCardDetailOpen: false }),
    setListDetail: (list: Card[]) => set({ isListCards: list }),
    setIndexDetail: (index: number) => set({ isIndex: index }),
    setDeckDetail: (deck: Card[]) => set({ isDeck: deck }),
}));