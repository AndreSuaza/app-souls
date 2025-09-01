import { Card } from "@/interfaces";
import Image from "next/image";
import { IoAddCircleOutline, IoEyeOutline } from "react-icons/io5";
import clsx from 'clsx';
import { useCardDetailStore } from "@/store";
import { CardDetail } from "../card-detail/CardDetail";

interface Props {
    count: number;
    card: Card;
    index: number;
    dropCard: (c: Card) => void
    addCard: (c: Card) => void
    detailCard: (i: number) => void
}


export const CardItemDeckList = ({card, count, index, dropCard, addCard, detailCard}:Props) => {

  const isCardDetailOpen = useCardDetailStore( state => state.isCardDetailOpen);
  const openCardDetail = useCardDetailStore( state => state.openCardDetail);
  const isDeck = useCardDetailStore( state => state.isDeck);

  const openDetail = () => {
      openCardDetail();
      detailCard(index);
  }

  return (
    <div 
        className="shadow-sm mb-1 cursor-pointer overflow-hidden rounded-md"
    >
        <div 
          className="h-9 z-0 "
        >
            
            <div className="relative flex flex-row h-9 bg-black bg-opacity-40 uppercase font-bold text-white">
            <p className="w-8 bg-black bg-opacity-50 text-center pt-2">{count}</p>
            <p className="pt-2 ml-2 w-80 overflow-hidden" onClick={()=>dropCard(card)}>{card.name}</p>
            <div className="bg-black bg-opacity-50 flex flex-row px-1">
            <IoEyeOutline 
              className="w-6 h-6 mt-2"
              onClick={()=>openDetail()}
            />
            <IoAddCircleOutline 
              className={
                clsx( "w-6 h-6 mt-2 ml-1", { "text-gray-500": count > 1  })
              }
              onClick={()=>addCard(card)}
            />
            </div>
            </div>
            <Image
                    src={`/cards/${card.code}-${card.idd}.webp`}
                    alt={card.name}
                    className='-mt-[50%]'
                    width={500}
                    height={50}
                />
        </div>
        {isCardDetailOpen && (
            <CardDetail cards={isDeck} indexList={index} />
        )}  
    </div>
  )
}
