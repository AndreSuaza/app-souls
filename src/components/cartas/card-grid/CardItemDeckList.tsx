import { Card } from "@/interfaces";
import Image from "next/image";
import { IoAddCircleOutline, IoEyeOutline } from "react-icons/io5";
import clsx from 'clsx';

interface Props {
    count: number;
    card: Card;
    dropCard: (c: Card) => void
    addCard: (c: Card) => void
}


export const CardItemDeckList = ({card, count, dropCard, addCard}:Props) => {

  return (
    <div 
        className="shadow-sm mb-1 cursor-pointer "
    >
        <div className="pl-1 bg-black bg-opacity-50 absolute right-2 md:right-7 z-10 text-white flex flex-row h-10">
        <IoEyeOutline 
          className="w-6 h-6 mt-2"
          onClick={()=>addCard(card)}
        />
        <IoAddCircleOutline 
          className={
            clsx( "w-6 h-6 mt-2 ml-1", { "text-gray-500": count > 1  })
          }
          onClick={()=>addCard(card)}
        />
        </div>
        <div 
          className="h-10 z-0 overflow-hidden rounded-md"
          onClick={()=>dropCard(card)}
        >
            
            <div className="relative flex flex-row h-10 bg-black bg-opacity-40 uppercase font-bold text-white">
            <p className="w-8 bg-black bg-opacity-50 text-center pt-2">{count}</p>
            <p className="pt-2 ml-2 w-80">{card.name}</p>
            </div>
            <Image
                    src={`/cards/${card.code}-${card.idd}.webp`}
                    alt={card.name}
                    className='-mt-[50%]'
                    width={500}
                    height={50}
                />
        </div>
    </div>
  )
}
