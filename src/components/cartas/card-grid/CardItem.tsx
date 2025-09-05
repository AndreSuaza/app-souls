
'use client';

import Image from 'next/image';
import { Card } from '@/interfaces/cards.interface';
import { IoAddCircleOutline, IoEyeOutline, IoMedkitOutline } from 'react-icons/io5';
import { useCardDetailStore } from '@/store';

interface Props {
    card: Card;
    index: number
    detailCard: (i: number) => void
    addCard?: (c: Card) => void
    addCardSidedeck?: (c: Card) => void
}

export const CardItem = ({ card, index, detailCard, addCard, addCardSidedeck}: Props) => {

  const openCardDetail = useCardDetailStore( state => state.openCardDetail);
  
  const openDetail = () => {
      openCardDetail();
      detailCard(index);
  }

  return (
    <div key={ card.id } className="flex flex-col transition-all hover:-mt-2 drop-shadow-lg">
      <div 
        className='rounded-xl overflow-hidden fade-in'
    >
        <div className="absolute top-16 -right-1 z-10">
            <IoEyeOutline 
              className="w-8 h-8 bg-slate-500 text-white p-1 rounded cursor-pointer"
              title='Detalle de la carta'
              onClick={()=>openDetail()}
            />
            { addCard && card.types.filter(type => type.name === "Alma").length === 0 &&
              <>
              <IoAddCircleOutline 
                className="w-8 h-8 mt-1 bg-indigo-500 text-white p-1 rounded select-none cursor-pointer"
                title='Añadir carta '
                onClick={() => addCard && addCard(card)}
              />
              <IoMedkitOutline 
                className="w-8 h-8 mt-1 bg-blue-500 text-white p-1 rounded select-none cursor-pointer"
                title='Añadir carta mazo apoyo'
                onClick={() => addCardSidedeck && addCardSidedeck(card)}
              /> 
              </>
            }
        </div>
        <Image
            src={`/cards/${card.code}-${card.idd}.webp`}
            alt={card.name}
            className='w-full object-cover'
            width={500}
            height={718}
            onClick={() => addCard && addCard(card)}
        />
      </div>
    </div>
  )
}
