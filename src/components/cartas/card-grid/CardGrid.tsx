'use client';

import type { Card } from "@/interfaces";
import { CardItem } from "./CardItem";

interface Props {
    cards: Card[];
    addCard?: (c: Card) => void
}

export const CardGrid = ({cards, addCard}: Props) => {

  return (
    <>
    <div className="col-span-2 lg:col-span-3 my-2 md:my-4">
        <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 mb-10 px-2'>

            {
                cards.map( card => (
                  <li key={card.id} ><CardItem card={card} addCard={addCard}/></li>
                ))
            }
        </ul>
    </div>

    </>
  )
}
