'use client';

import type { Card } from "@/interfaces";
import { useCardDetailStore } from "@/store";
import { CardDetail } from '../card-detail/CardDetail';
import { useEffect, useRef, useState } from "react";
import clsx from 'clsx';
import { CardItemDeckList } from "@/components/cartas/card-grid/CardItemDeckList";
import { CardItem } from "@/components/cartas/card-grid/CardItem";
import { CardGrid } from "../card-grid/CardGrid";


interface Props {
    cards: Card[];
    className?: string
}

interface Decklist {
    count: number;
    card: Card;
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

export const DeckCreator = ({cards, className}: Props) => {

  const [positionFixed, setPositionFixed] = useState(false);
  const [deckListMain, setDeckListMain] = useState<Decklist[]>([]);
  const [deckListLimbo, setDeckListLimbo] = useState<Decklist[]>([]);
  const [deckListMainSideDeck, setDeckListMainSideDeck] = useState<Decklist[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  const isCardDetailOpen = useCardDetailStore( state => state.isCardDetailOpen);

  const addCard = (cardSeleted: Card) => {

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

  useEffect(() => {
    const handleScroll = () => {
      if(window.scrollY > 180) {setPositionFixed(true);}
      else {setPositionFixed(false);}
    };

    // Agregar el evento
    window?.addEventListener('scroll', handleScroll);

    // Limpiar el evento al desmontar el componente
    return () => {
      window?.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <div className="grid grid-cols-4 ">
      <div className="col-span-2 lg:col-span-3 sm:my-10">
        <CardGrid cards={cards} addCard={addCard}/>
      </div>
      <div ref={containerRef} 
            className={
            clsx(
                            "fixed bg-gray-200 rounded-s-lg right-0 transition-all md:my-10 w-1/2 lg:w-1/4 h-5/6 px-4 py-2",
                            {
                                "fixed -mt-[12rem] md:-mt-[180px]": positionFixed
                            }
                        )}
      >
        <h1>Botones</h1>
        <div className="border-b-2 pb-1">
          <h3 className="font-bold">Mazo de Limbo</h3>
        {
          deckListLimbo.map( (deck, index) => (
              <CardItemDeckList card={deck.card} count={deck.count} dropCard={() => dropCard(deck.card)}/>
          ))
        }
        </div>
        <div>
          <h3 className="font-bold mt-2">Mazo Principal</h3>
        {
          deckListMain.map( (deck, index) => (
            <CardItemDeckList card={deck.card} count={deck.count} dropCard={() => dropCard(deck.card)}/>
          ))
        }
        </div>
      </div>
    </div>
  )
}
