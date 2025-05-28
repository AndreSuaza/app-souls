import { Card } from "@/interfaces";
import Image from "next/image";
import { IoAddCircleOutline, IoCloseCircleOutline, IoEyeOutline } from "react-icons/io5";
import { useCardDetailStore } from "@/store";

interface Props {
    count: number;
    card: Card;
    index: number;
    dropCard: (c: Card) => void
    addCard: (c: Card) => void
    detailCard: (i: number) => void
}


export const CardItemList = ({card, count, index, dropCard, addCard, detailCard}:Props) => {

  const openCardDetail = useCardDetailStore( state => state.openCardDetail);

  const openDetail = () => {
      openCardDetail();
      detailCard(index);
  }

  return (
    <div className="flex relative">
    <div className="absolute top-8 -right-1 z-10">
        <div className="w-6 h-6 bg-lime-600 rounded text-white text-center font-bold">
          {count}
        </div>
        <IoEyeOutline 
          className="w-6 h-6 mt-1 bg-indigo-600 p-0.5 text-white rounded cursor-pointer"
          onClick={()=>openDetail()}
        />
        <IoAddCircleOutline 
          className="w-6 h-6 mt-1 bg-indigo-600 text-white p-0.5 rounded select-none cursor-pointer"
          onClick={() => addCard && addCard(card)}
        />
        <IoCloseCircleOutline  
          className="w-6 h-6 mt-1 bg-orange-600 text-white p-0.5 rounded select-none cursor-pointer"
          onClick={()=>dropCard(card)}
        />
    </div>
    <Image
      src={`/cards/${card.code}-${card.idd}.webp`}
      className="rounded-md"
      alt={card.name}
      width={500}
      height={718}
    />
    </div>
  )
}
