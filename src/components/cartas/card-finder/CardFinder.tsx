'use client';

import { CardFinderLab, Pagination } from "@/components"
import { CardGrid } from "../card-grid/CardGrid"
import { Card } from "@/interfaces";

//Mover a interface

interface Propertie {
  id: string,
  name: string,
}

interface Properties {
  products: Propertie[],
  types: Propertie[],
  archetypes: Propertie[],
  keywords: Propertie[],
  rarities: Propertie[],
}

interface Props {
    cards: Card[];
    propertiesCards: Properties;
    totalPage: number;
    cols?: number;
    addCard?: (c: Card) => void;
    addCardSidedeck?: (c: Card) => void;
}

export const CardFinder = ({cards, propertiesCards, totalPage, cols = 6, addCard, addCardSidedeck}: Props) => {

  return (
    <div>
        <div>
          <CardFinderLab propertiesCards={propertiesCards} cols={cols}/>
          <Pagination totalPages={totalPage}>
          <CardGrid cards={cards} addCard={addCard} addCardSidedeck={addCardSidedeck} cols={cols}/>
          </Pagination>
        </div>
        
    </div>
  )
}
