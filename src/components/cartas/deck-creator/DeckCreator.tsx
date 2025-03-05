'use client';

import type { Card } from "@/interfaces";
import { useEffect, useState } from "react";
import clsx from 'clsx';
import { CardItemDeckList } from "@/components/cartas/card-grid/CardItemDeckList";
import { CardGrid } from "../card-grid/CardGrid";
import { IoDownloadOutline, IoImageOutline, IoLogoUsd, IoPushOutline, IoSwapHorizontalSharp, IoTrashOutline } from "react-icons/io5";


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

  const [mazoApoyo, setMazoApoyo] = useState(false);
  const [positionFixed, setPositionFixed] = useState(false);
  const [deckListMain, setDeckListMain] = useState<Decklist[]>([]);
  const [deckListLimbo, setDeckListLimbo] = useState<Decklist[]>([]);
  const [deckListMainSideDeck, setDeckListMainSideDeck] = useState<Decklist[]>([]);

  const addCard = (cardSeleted: Card) => {

    if(cardSeleted.types.filter(type => type.name === "Limbo").length === 0) {

      if(deckListMain.reduce((acc, deck) => acc + deck.count, 0) > 39) return
      if(cardSeleted.types.filter(type => type.name === "Alma").length > 0) { return }
      if(cardSeleted.types.filter(type => type.name === "Ficha").length > 0) { return }

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

  const countDecklist = (decklist: Decklist[]) => {
    return decklist.reduce((acc, deck) => acc + deck.count, 0)
  }

  const priceDeck = () => {
    const main = deckListMain.reduce((acc, deck) => acc + deck.card.price, 0);
    const limbo = deckListMain.reduce((acc, deck) => acc + deck.card.price, 0);

    return main+limbo;
  }

  const clearDecklist = () => {
    setDeckListMain([]);
    setDeckListLimbo([]);
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
      <div className="col-span-2 lg:col-span-3">
        <CardGrid cards={cards} addCard={addCard}/>
      </div>
      <div className={
            clsx("fixed bg-gray-200 right-0 transition-all w-1/2 px-4 py-2 h-screen lg:w-1/4",
                            {
                                "fixed -mt-[12rem] md:-mt-[180px]": positionFixed
                            })}
      >
        <div className="grid grid-cols-3 md:flex md:flex-row gap-1 mb-1">
            {/* <button className="btn-short" title="Mazo de apoyo">
              <IoSwapHorizontalSharp className="text-indigo-600 w-6 h-6 -mb-0.5"/>
            </button> */}
            <button className="btn-short" title="Importar Mazo">
              <IoDownloadOutline className="w-6 h-6 -mt-0.5"/>
            </button>
            <button className="btn-short" title="Exportar Mazo">
              <IoPushOutline className="w-6 h-6 -mb-0.5"/>
            </button>
            <button className="btn-short" title="Limpiar Mazo" onClick={clearDecklist}>
              <IoTrashOutline className="w-6 h-6 -mb-0.5"/>
            </button>
            <button className="btn-short" title="Exportar Imagen">
              <IoImageOutline className="w-6 h-6 -mb-0.5"/>          
            </button>       
            <span className="flex flex-row py-2 px-2 font-bold"><IoLogoUsd className="w-6 h-6 -mb-0.5"/> { priceDeck() }</span>
          </div>
        <div className="overflow-auto h-cal-200">
          
          <div className="border-b-2 bg-yellow-500 px-1.5 py-1 rounded-lg">
            <h3 className="font-bold ml-2 text-black">{`${countDecklist(deckListLimbo)} Mazo de Limbo`}</h3>
            {
              deckListLimbo.map( (deck, index) => (
                  <CardItemDeckList card={deck.card} count={deck.count} dropCard={() => dropCard(deck.card)}/>
              ))
            }
          </div>
          <div className="px-1.5 rounded-lg">
            <h3 className="font-bold ml-2 text-black">{`${countDecklist(deckListMain)} Mazo de principal`}</h3>
            {
              deckListMain.map( (deck, index) => (
                <CardItemDeckList card={deck.card} count={deck.count} dropCard={() => dropCard(deck.card)}/>
              ))
            }
          </div>              
        </div>
        
      </div>
    </div>
  )
}
