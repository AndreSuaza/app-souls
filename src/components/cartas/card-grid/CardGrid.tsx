"use client"

import type { Card } from "@/interfaces";
import { useCardDetailStore } from "@/store";
import { CardItem } from "./CardItem";
import { CardDetail } from '../card-detail/CardDetail';


interface Props {
    cards: Card[];
}

export const CardGrid = ({cards}: Props) => {

  const isCardDetailOpen = useCardDetailStore( state => state.isCardDetailOpen);

  return (
    <>
    <div className='grid grid-cols-2 sm:grid-cols-4 gap-10 mb-10 px-2'>
        {
            cards.map( card => (
                <div className="flex flex-col transition-all hover:-mt-2 cursor-pointer drop-shadow-lg">
                <p className="text-center font-semibold mb-3 text-md">{card.name}</p>
                <CardItem 
                  key={ card.id }
                  card={card}
                />
               </div>
            ))
        }

    </div>
    {isCardDetailOpen && (
      <CardDetail cards={cards}/>
    )}
    </>
  )
}
