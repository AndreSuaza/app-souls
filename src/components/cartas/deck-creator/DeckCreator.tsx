'use client';

import type { Card } from "@/interfaces";
import { useEffect, useState } from "react";
import { OptionsDeckCreator } from "./OptionsDeckCreator";
import { Decklist } from "@/interfaces/decklist.interface";
import { CardFinder } from "../card-finder/card-finder";
import { ShowDeck } from "./ShowDeck";


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
    totalPages: number;
    mainDeck?: Decklist[];
    sideDeck?: Decklist[];
    className?: string
}

const addCardLogic = (deckListSelected:Decklist[], cardfound: Decklist | undefined, cardSeleted: Card) => {

  if(cardfound) {
    if(cardfound.count < 2) {
      const updatedCards = deckListSelected.map((deck) => deck.card.name === cardSeleted.name ? {card: deck.card, count: 2 } : deck);
      return updatedCards
    }
  } else {
    return [...deckListSelected, {card:cardSeleted, count:1}];
  }

}

const dropCardLogic = (deckListSelected:Decklist[], cardfound: Decklist | undefined, cardSeleted: Card) => {

    if(cardfound && cardfound.count === 2) {
      const updatedCards = deckListSelected.map((deck) => deck.card.name === cardSeleted.name ? {card: deck.card, count: 1 } : deck);
      return updatedCards
    } else {
      return deckListSelected.filter((cardDeck) => cardDeck.card.name != cardSeleted.name); 
    }
}

const addCardDecklist = (deckListSelected:Decklist[], cardSeleted: Card) => {

  const cardfound = deckListSelected.find(cardDeck => cardDeck.card.name == cardSeleted.name);

  return addCardLogic(deckListSelected, cardfound, cardSeleted);

}

const dropCardDecklist = (deckListSelected:Decklist[], cardSeleted: Card) => {

  const cardfound = deckListSelected.find(cardDeck => cardDeck.card.name == cardSeleted.name);

  return dropCardLogic(deckListSelected, cardfound, cardSeleted);

}

export const DeckCreator = ({cards, propertiesCards, totalPages, mainDeck, sideDeck}: Props) => {

  const [deckListMain, setDeckListMain] = useState<Decklist[]>([]);
  const [deckListLimbo, setDeckListLimbo] = useState<Decklist[]>([]);
  const [deckListSide, setDeckListSide] = useState<Decklist[]>([]);
  const [viewList, setViewList] = useState(false);

  const importDeck = () => {
      if (mainDeck) {
          const main = mainDeck.filter(c => !c.card.types.some(type => type.name === "Limbo"));
          const limbo = mainDeck.filter(c => c.card.types.some(type => type.name === "Limbo"));

          const mainCount = main.reduce((acc, deck) => acc + deck.count, 0);
          const limboCount = limbo.reduce((acc, deck) => acc + deck.count, 0);

          if (mainCount <= 40) setDeckListMain(main);
          if (limboCount <= 6) setDeckListLimbo(limbo);
      }

      if (sideDeck) {
          const side = [...sideDeck]; // copiar por si acaso
          const sideCount = side.reduce((acc, deck) => acc + deck.count, 0);

          if (sideCount <= 40) setDeckListSide(side);
      }
  }

  useEffect(() => {
        importDeck();
    }, []);

  const addCard = (cardSeleted: Card) => {

      if(cardSeleted.types.filter(type => type.name === "Alma").length > 0) { return }
      if(cardSeleted.types.filter(type => type.name === "Ficha").length > 0) { return }

      if(cardSeleted.types.filter(type => type.name === "Limbo").length === 0) {

        if(deckListMain.reduce((acc, deck) => acc + deck.count, 0) > 39) return
        const result = addCardDecklist(deckListMain, cardSeleted);
        if(result) { setDeckListMain(result); }

      } else {

        if(deckListLimbo.reduce((acc, deck) => acc + deck.count, 0) > 5) return

        const result = addCardDecklist(deckListLimbo, cardSeleted);
        if(result) { setDeckListLimbo(result); }
      }

  }

  const dropCard = (cardSeleted: Card) => {

    if(cardSeleted.types.filter(type => type.name === "Limbo").length === 0) {
        const result = dropCardDecklist(deckListMain, cardSeleted);
        if(result) { setDeckListMain(result); }
    } else {
        const result = dropCardDecklist(deckListLimbo, cardSeleted);
        if(result) { setDeckListLimbo(result); }
    }

  }

  const dropCardSideDeck = (cardSeleted: Card) => {

      const result = dropCardDecklist(deckListSide, cardSeleted);
      if(result) { setDeckListSide(result); }
  
  }
    
  const addCardSideDeck = (cardSeleted: Card) => {

      if(cardSeleted.types.filter(type => type.name === "Alma").length > 0) { return }
      if(cardSeleted.types.filter(type => type.name === "Ficha").length > 0) { return }
      if(deckListSide.reduce((acc, deck) => acc + deck.count, 0) > 9) return

      const result = addCardDecklist(deckListSide, cardSeleted);
      if(result) { setDeckListSide(result); }
  }

  const clearDecklist = () => {
    setDeckListMain([]);
    setDeckListLimbo([]);
    setDeckListSide([]);
  }

  const changeViewList = () => {
    setViewList(!viewList)
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 mb-6">
      <div className="">
       <CardFinder cards={cards} propertiesCards={propertiesCards} totalPage={totalPages} cols={2} addCard={addCard} addCardSidedeck={addCardSideDeck}/>
      </div>
      <div className="col-span-1 md:col-span-3 mt-6 mx-2"
      >
      <div className="flex my-2">  
        <OptionsDeckCreator 
          deckListMain={deckListMain} 
          deckListLimbo={deckListLimbo} 
          deckListSide={deckListSide} 
          clearDecklist={clearDecklist}
          changeViewList={changeViewList}
          viewList={viewList}
        />
      </div>
      <ShowDeck deckListMain={deckListMain} deckListLimbo={deckListLimbo} deckListSide={deckListSide} addCard={addCard} dropCard={dropCard} addCardSide={addCardSideDeck} dropCardSide={dropCardSideDeck}/>           
      </div>  
    </div>
  )
}
