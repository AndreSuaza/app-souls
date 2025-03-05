'use client';

import type { Card } from "@/interfaces";
import { useCardDetailStore } from "@/store";
import { CardDetail } from '../card-detail/CardDetail';
import { CardItemDeckList } from "./CardItemDeckList";


interface Decklist {
    count: number;
    card: Card;
}

interface Props {
    deck: Decklist[];
    dropCard: (c: Card) => void
}

export const CardGridDeck = ({deck, dropCard}: Props) => {

  const isCardDetailOpen = useCardDetailStore( state => state.isCardDetailOpen);

  return (

    <div className="col-span-2 lg:col-span-3 sm:my-10">
        <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 mb-10 px-2'>

            {
                deck.map( (item, index) => (
                  <li key={index} ><CardItemDeckList card={item.card} count={item.count} dropCard={dropCard}/></li>
                ))
            }
        </ul>
    </div>

  )
}
