'use client';

import { CardDetail } from "@/components/cartas/card-detail/CardDetail";
import { Card } from "@/interfaces"
import { useCardDetailStore } from "@/store";
import Image from "next/image"
import { useState } from "react";

interface Props {
    cards: Card[];
}

export const CompleteCollection = ({cards}: Props) => {

    const isCardDetailOpen = useCardDetailStore( state => state.isCardDetailOpen);
    const openCardDetail = useCardDetailStore( state => state.openCardDetail);
    const [index, setIndex] = useState(0);
    
    const openDetail = (i: number) => {
        openCardDetail();
        setIndex(i);
    }
  

  return (
    <>
    <ul className='grid grid-cols-4 md:grid-cols-8 gap-3 mx-2'>
     {cards.map((card, index) => 
      <li key={card.id} onClick={() => openDetail(index)} className="cursor-pointer">
        <Image
            src={`/cards/${card.code}-${card.idd}.webp`}
            alt={card.name}
            className='object-cover rounded-lg'
            width={500}
            height={718}
        />
     </li>)}
    </ul>
    {isCardDetailOpen && (
        <CardDetail cards={cards} indexList={index}/>
      )}
    </>
  )
}
