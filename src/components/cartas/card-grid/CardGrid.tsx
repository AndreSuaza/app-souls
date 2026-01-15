"use client";

import type { Card } from "@/interfaces";
import { CardItem } from "./CardItem";
import { useCardDetailStore } from "@/store";
import { CardDetail } from "../card-detail/CardDetail";
import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface Props {
  cards: Card[];
  columns?: number;
  smColumns?: number;
  mdColumns?: number;
  lgColumns?: number;
  xlColumns?: number;
  addCard?: (c: Card) => void;
  addCardSidedeck?: (c: Card) => void;
}

const getGridClass = (
  breakpoint: "sm" | "md" | "lg" | "xl",
  value: number
) => {
  switch (value) {
    case 1:
      return `${breakpoint}:grid-cols-1`;
    case 2:
      return `${breakpoint}:grid-cols-2`;
    case 3:
      return `${breakpoint}:grid-cols-3`;
    case 4:
      return `${breakpoint}:grid-cols-4`;
    case 5:
      return `${breakpoint}:grid-cols-5`;
    default:
      return `${breakpoint}:grid-cols-6`;
  }
};

export const CardGrid = ({
  cards,
  columns = 6,
  smColumns,
  mdColumns,
  lgColumns,
  xlColumns,
  addCard,
  addCardSidedeck,
}: Props) => {
  const isCardDetailOpen = useCardDetailStore(
    (state) => state.isCardDetailOpen
  );
  const [indexDeck, setIndexDeck] = useState(0);
  const openCardDetail = useCardDetailStore((state) => state.openCardDetail);

  const detailCard = (index: number) => {
    setIndexDeck(index);
    openCardDetail();
  };

  return (
    <>
      <div className="mt-4">
        <motion.ul
          layout
          className={clsx(
            "grid gap-4 grid-cols-1",
            getGridClass("sm", smColumns ?? 2),
            getGridClass("md", mdColumns ?? 4),
            getGridClass("lg", lgColumns ?? columns),
            getGridClass("xl", xlColumns ?? columns)
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {cards.map((card, index) => (
            <motion.li key={card.id} layout>
              <CardItem
                card={card}
                addCard={addCard}
                addCardSidedeck={addCardSidedeck}
                index={index}
                detailCard={detailCard}
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
      {isCardDetailOpen && <CardDetail cards={cards} indexList={indexDeck} />}
    </>
  );
};
