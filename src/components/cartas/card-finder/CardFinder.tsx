'use client';

import { CardFinderLab, Pagination } from "@/components"
import { CardGrid } from "../card-grid/CardGrid"
import { Card } from "@/interfaces";
import { CardFinderLabLocal, type PaginationFilters } from "../../finders/CardFinderLabLocal";

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
    currentPage?: number;
    onPageChange?: (page: number) => void;
    onSearch?: (filters: PaginationFilters) => void;
}

export const CardFinder = ({cards, propertiesCards, totalPage, cols = 6, addCard, addCardSidedeck, currentPage, onPageChange, onSearch}: Props) => {

  return (
    <div>
        <div>
          {onSearch ? (
            <CardFinderLabLocal propertiesCards={propertiesCards} cols={cols} onSearch={onSearch} />
          ) : (
            <CardFinderLab propertiesCards={propertiesCards} cols={cols} />
          )}
          <Pagination totalPages={totalPage} currentPage={currentPage} onPageChange={onPageChange}>
          <CardGrid cards={cards} addCard={addCard} addCardSidedeck={addCardSidedeck} cols={cols}/>
          </Pagination>
        </div>
        
    </div>
  )
}
