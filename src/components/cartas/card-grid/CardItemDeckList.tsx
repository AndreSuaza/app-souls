"use client";

import { useEffect, useState } from "react";
import { Card } from "@/interfaces";
import Image from "next/image";
import { cardImageBlurDataURL } from "@/models/images.models";
import { IoAddCircleOutline } from "react-icons/io5";
import clsx from 'clsx';

interface Props {
    count: number;
    card: Card;
    index: number;
    dropCard: (c: Card) => void
    addCard: (c: Card) => void
}


export const CardItemDeckList = ({card, count, dropCard, addCard}:Props) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [card.code, card.idd]);

  // const isCardDetailOpen = useCardDetailStore( state => state.isCardDetailOpen);
  // const openCardDetail = useCardDetailStore( state => state.openCardDetail);

  // const openDetail = () => {
  //     openCardDetail();
  //     detailCard(index);
  // }

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
            {/* <IoEyeOutline 
              className="w-6 h-6 mt-2"
              onClick={()=>openDetail()}
            /> */}
            <IoAddCircleOutline 
              className={
                clsx( "w-6 h-6 mt-2 ml-1", { "text-gray-500": count > 1  })
              }
              onClick={()=>addCard(card)}
            />
            </div>
            </div>
            <div className="relative overflow-hidden bg-[url('/howtoplay/mazo-principal.webp')] bg-cover bg-center">
                {/* El fondo actúa como placeholder para evitar duplicar altura en el grid. */}
                <Image
                    src={`/cards/${card.code}-${card.idd}.webp`}
                    alt={card.name}
                    title={card.name}
                    placeholder="blur"
                    blurDataURL={cardImageBlurDataURL}
                    className={`-mt-[50%] transition-opacity ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                    width={500}
                    height={50}
                    onLoadingComplete={() => setIsImageLoaded(true)}
                />
            </div>
        </div>
    </div>
  )
}
