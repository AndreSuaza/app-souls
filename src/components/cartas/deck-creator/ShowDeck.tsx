
'use client';

import { CardItemList } from "../card-grid/CardItemList";
import { Card, Decklist } from "@/interfaces";
import { useEffect, useState } from "react";

interface Props {
    deckListMain: Decklist[];
    deckListLimbo: Decklist[];
    deckListSide: Decklist[];
    dropCard?: (c: Card) => void
    addCard?: (c: Card) => void
    dropCardSide?: (c: Card) => void
    addCardSide?: (c: Card) => void
}



export const ShowDeck = ({deckListMain, deckListLimbo, deckListSide, dropCard, addCard, dropCardSide, addCardSide}: Props) => {

    const [numCards, setNumCard] = useState({und: 0, arm: 0, con: 0, ent: 0}) 

    const countDecklist = (decklist: Decklist[]) => {
        return decklist.reduce((acc, deck) => acc + deck.count, 0)
    }

    const countCardsTypes = () => {
      const typeMap: Record<string, keyof typeof initialCounts> = {
        Unidad: "und",
        Arma: "arm",
        Conjuro: "con",
        Ente: "ent",
      };

      const initialCounts = { und: 0, arm: 0, con: 0, ent: 0 };

      const updatedNumCards = deckListMain.reduce((acc, deck) => {
        deck.card.types.forEach(type => {
          const key = typeMap[type.name];
          if (key) acc[key] += deck.count;
        });
        return acc;
      }, { ...initialCounts });

      setNumCard(updatedNumCards);
    };

    

  useEffect(() => {
    countCardsTypes()
  }, [deckListMain])



  return (
    <>
    
    <div className="border-2 p-2 rounded-xl shadow-md bg-slate-100">
            
            <div className="flex flex-col">

            <h2 className="bg-yellow-500 py-1 px-2 rounded text-sm md:text-2xl uppercase font-bold mb-2 text-white">Mazo Limbo</h2>
      
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {
              deckListLimbo.slice().reverse().map( (deck, index) => 
                <CardItemList 
                  key={deck.card.id+index} 
                  card={deck.card} 
                  count={deck.count} 
                  dropCard={dropCard} 
                  addCard={addCard} 
                />
              )
            }
            </div>

            <h2 className="bg-indigo-500 px-2 py-1 rounded text-sm md:text-2xl uppercase font-bold my-2 pr-6 text-white">Mazo Principal</h2>
            <ul className="flex flex-row bg-gray-900 p-1 rounded-md mb-1 text-white">
              <li className="mr-2"><span className="font-bold ml-2">T:</span> {countDecklist(deckListMain)}</li>
              <li className="mr-2"><span className="font-bold text-red-600">U:</span> {numCards.und}</li>
              <li className="mr-2"><span className="font-bold text-purple-700">C:</span> {numCards.con}</li>
              <li className="mr-2"><span className="font-bold text-gray-400">A:</span> {numCards.arm}</li>
              <li className="mr-2"><span className="font-bold text-yellow-500">E:</span> {numCards.ent}</li>
            </ul>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {
              deckListMain.slice().reverse().map( (deck, index) => 

                <CardItemList 
                  key={deck.card.id+index} 
                  card={deck.card} 
                  count={deck.count} 
                  dropCard={dropCard} 
                  addCard={addCard} 
                />
                
              )
            }
            </div>

            <h2 className="bg-blue-500 py-1 px-2 rounded text-sm md:text-2xl uppercase font-bold my-2 text-white">Mazo Apoyo</h2>
      
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {
              deckListSide.slice().reverse().map( (deck, index) => 

                <CardItemList 
                  key={deck.card.id+index} 
                  card={deck.card} 
                  count={deck.count} 
                  dropCard={dropCardSide} 
                  addCard={addCardSide} 
                />
                
              )
            }
            </div>
    </div>  
    </>
  )
}
