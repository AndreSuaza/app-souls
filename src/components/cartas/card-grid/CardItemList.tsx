import { Card } from "@/interfaces";
import Image from "next/image";
import { IoAddCircleOutline, IoCloseCircleOutline } from "react-icons/io5";

interface Props {
    count: number;
    card: Card;
    dropCard?: (c: Card) => void
    addCard?: (c: Card) => void
}


export const CardItemList = ({card, count, dropCard, addCard}:Props) => {

  // const openCardDetail = useCardDetailStore( state => state.openCardDetail);
  // const isCardDetailOpen = useCardDetailStore( state => state.isCardDetailOpen);

  // const openDetail = () => {
  //     openCardDetail();
  //     detailCard(index);
  // }

  return (
    <div className="flex relative">
      <Image
        src={`/cards/${card.code}-${card.idd}.webp`}
        className="rounded-md"
        alt={card.name}
        width={500}
        height={718}
      />
      <div className="absolute top-8 -right-1 z-0">
        <div className="w-6 h-6 bg-lime-600 rounded text-white text-center font-bold">
          {count}
        </div>
        {addCard && (
          <IoAddCircleOutline
            className="w-6 h-6 mt-1 bg-indigo-600 text-white p-0.5 rounded select-none cursor-pointer"
            onClick={() => addCard(card)}
          />
        )}
        {dropCard && (
          <IoCloseCircleOutline
            className="w-6 h-6 mt-1 bg-orange-600 text-white p-0.5 rounded select-none cursor-pointer"
            onClick={() => dropCard(card)}
          />
        )}
      </div>
    </div>
  );
}
