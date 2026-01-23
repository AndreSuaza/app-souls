"use client";

import { CardDetail } from "@/components/cartas/card-detail/CardDetail";
import { Card } from "@/interfaces";
import { useCardDetailStore } from "@/store";
import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";

interface Props {
  cards: Card[];
  className?: string;
  backgroundVariant?: "showcase";
}

export const CompleteCollection = ({
  cards,
  className,
  backgroundVariant,
}: Props) => {
  const isCardDetailOpen = useCardDetailStore(
    (state) => state.isCardDetailOpen,
  );
  const openCardDetail = useCardDetailStore((state) => state.openCardDetail);
  const [index, setIndex] = useState(0);

  const openDetail = (i: number) => {
    openCardDetail();
    setIndex(i);
  };

  return (
    <>
      {backgroundVariant === "showcase" ? (
        <div className="w-full bg-transparent p-3">
          <ul
            className={clsx(
              "grid grid-cols-4 md:grid-cols-8 gap-3 mx-2",
              className,
              "bg-transparent",
            )}
          >
            {cards.map((card, index) => (
              <li
                key={card.id}
                onClick={() => openDetail(index)}
                className="cursor-pointer transition-transform duration-200 hover:-translate-y-2"
              >
                <Image
                  src={`/cards/${card.code}-${card.idd}.webp`}
                  alt={card.name}
                  className="object-cover rounded-lg"
                  width={500}
                  height={718}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul
          className={clsx(
            "grid grid-cols-4 md:grid-cols-8 gap-3 mx-2",
            className,
          )}
        >
          {cards.map((card, index) => (
          <li
            key={card.id}
            onClick={() => openDetail(index)}
            className="cursor-pointer transition-transform duration-200 hover:-translate-y-2"
          >
              <Image
                src={`/cards/${card.code}-${card.idd}.webp`}
                alt={card.name}
                className="object-cover rounded-lg"
                width={500}
                height={718}
              />
            </li>
          ))}
        </ul>
      )}
      {isCardDetailOpen && <CardDetail cards={cards} indexList={index} />}
    </>
  );
};
