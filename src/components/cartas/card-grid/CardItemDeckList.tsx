import { Card } from "@/interfaces";
import Image from "next/image";

interface Props {
    count: number;
    card: Card;
    dropCard: (c: Card) => void
}


export const CardItemDeckList = ({card, count, dropCard}:Props) => {
  return (
    <div 
        className="shadow-sm mb-1 cursor-pointer "
        onClick={()=>dropCard(card)}
    >
        <div className="h-10 z-0 overflow-hidden rounded-md">
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
