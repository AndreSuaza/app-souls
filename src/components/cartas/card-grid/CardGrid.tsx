'use client';

import type { Card } from "@/interfaces";
import { CardItem } from "./CardItem";
import { useCardDetailStore } from "@/store";
import { CardDetail } from "../card-detail/CardDetail";
import { useState } from "react";

interface Props {
    cards: Card[];
    cols: number
    addCard?: (c: Card) => void
    addCardSidedeck?: (c: Card) => void
}

export const CardGrid = ({cards, cols, addCard, addCardSidedeck}: Props) => {

    const isCardDetailOpen = useCardDetailStore( state => state.isCardDetailOpen);
    const [indexDeck, setIndexDeck] = useState(0);
    const openCardDetail = useCardDetailStore( state => state.openCardDetail );
    
    const detailCard = (index: number) => {
      setIndexDeck(index);
      openCardDetail();
    }

    const colsGrid = () => {
      switch (cols) {
        case 6:
          return 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mx-4 mb-10 px-2'
        case 2:
          return 'mt-6 h-[560px] overflow-hidden overflow-y-scroll grid grid-cols-1 md:grid-cols-2 gap-4 mx-4 mb-10 px-2'
        default:
          return 'grid grid-cols-1 mb-10 px-2'
      }
    } 

  return (
    <>
    <div className="mt-4">
        <ul className={colsGrid()}>

            {
                cards.map( (card, index) => (
                  <li key={card.id} >
                    <CardItem card={card} addCard={addCard} addCardSidedeck={addCardSidedeck} index={index} detailCard={detailCard}/>
                  </li>
                ))
            }
        </ul>
    </div>
    {isCardDetailOpen && (
          <CardDetail cards={cards} indexList={indexDeck} />
    )}          
    </>
  )
}
