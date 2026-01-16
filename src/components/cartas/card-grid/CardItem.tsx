"use client";

import Image from "next/image";
import { Card } from "@/interfaces/cards.interface";
import {
  IoAddCircleOutline,
  IoEyeOutline,
  IoMedkitOutline,
} from "react-icons/io5";
import { useCardDetailStore } from "@/store";

interface Props {
  card: Card;
  index: number;
  detailCard: (i: number) => void;
  addCard?: (c: Card) => void;
  addCardSidedeck?: (c: Card) => void;
}

export const CardItem = ({
  card,
  index,
  detailCard,
  addCard,
  addCardSidedeck,
}: Props) => {
  const openCardDetail = useCardDetailStore((state) => state.openCardDetail);

  const openDetail = () => {
    openCardDetail();
    detailCard(index);
  };

  return (
    <div key={card.id} className="flex flex-col transition-all hover:-mt-2">
      <div className="relative overflow-hidden rounded-2xl bg-slate-950/70 shadow-md shadow-gray-600 fade-in dark:bg-tournament-dark-muted-strong/40 dark:shadow-white">
        <div className="absolute top-16 -right-1 z-10">
          <IoEyeOutline
            className="w-8 h-8 bg-slate-500 text-white p-1 rounded cursor-pointer"
            title="Detalle de la carta"
            onClick={() => openDetail()}
          />
          {card.limit === "1" && (
            <div className="text-center text-2xl mt-1 bg-yellow-500 text-white rounded cursor-pointer">
              1
            </div>
          )}
          {addCard &&
            card.types.filter((type) => type.name === "Alma").length === 0 && (
              <>
                <IoAddCircleOutline
                  className="w-8 h-8 mt-1 bg-indigo-500 text-white p-1 rounded select-none cursor-pointer"
                  title="Añadir carta "
                  onClick={() => addCard && addCard(card)}
                />
                <IoMedkitOutline
                  className="w-8 h-8 mt-1 bg-blue-500 text-white p-1 rounded select-none cursor-pointer"
                  title="Añadir carta mazo apoyo"
                  onClick={() => addCardSidedeck && addCardSidedeck(card)}
                />
              </>
            )}
        </div>
        <button
          type="button"
          className="block w-full cursor-pointer"
          onClick={openDetail}
        >
          <Image
            src={`/cards/${card.code}-${card.idd}.webp`}
            alt={card.name}
            className="block w-full object-cover"
            width={500}
            height={718}
          />
        </button>
      </div>
    </div>
  );
};
