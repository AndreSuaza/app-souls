"use client";

"use client";

import type { Card } from "@/interfaces";
import { CardItem } from "./CardItem";
import { useCardDetailStore } from "@/store";
import { CardDetail } from "../card-detail/CardDetail";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  cards: Card[];
  columns?: number;
  addCard?: (c: Card) => void;
  addCardSidedeck?: (c: Card) => void;
}

export const CardGrid = ({
  cards,
  columns = 6,
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

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  };

  return (
    <>
      <div className="mt-4">
        <motion.ul
          layout
          style={gridStyle}
          className="grid gap-4"
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
