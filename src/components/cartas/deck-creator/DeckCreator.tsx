'use client';

import type { Card } from "@/interfaces";
import { useEffect, useState } from "react";
import { CardItemDeckList } from "@/components/cartas/card-grid/CardItemDeckList";
import { CardGrid } from "../card-grid/CardGrid";
import { CardFinderLab } from "@/components/finders/CardFinderLab";
import { CardDetail } from "../card-detail/CardDetail";
import { useCardDetailStore } from "@/store";
import { OptionsDeckCreator } from "./OptionsDeckCreator";
import { Decklist } from "@/interfaces/decklist.interface";


interface Props {
    cards: Card[];
    propertiesCards: any;
    deck?: Decklist[];
    className?: string
}

interface CardsDetail {
  deckList: Card[]; 
  index: number;
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

export const DeckCreator = ({cards, deck, propertiesCards}: Props) => {


  const [deckListMain, setDeckListMain] = useState<Decklist[]>([]);
  const [deckListLimbo, setDeckListLimbo] = useState<Decklist[]>([]);
  const [numCards, setNumCard] = useState({und: 0, arm: 0, con: 0, ent: 0}) 
  const [detalDecklistCards, setDetalDecklistCards] = useState<CardsDetail>({deckList: [], index: 0})
  const isCardDetailOpen = useCardDetailStore( state => state.isCardDetailOpen);

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

  const countCardsTypes = () => {
    const updatedNumCards = deckListMain.reduce((acc, deck) => {
      deck.card.types.forEach((type) => {
        switch (type.name) {
          case "Unidad":
            acc.und += 1 * deck.count;
            break;
          case "Arma":
            acc.arm += 1 * deck.count;
            break;
          case "Conjuro":
            acc.con += 1 * deck.count;
            break;
          case "Ente":
            acc.ent += 1 * deck.count;
            break;
          default:
            break;
        }
      });
      return acc;
    }, {und: 0, arm: 0, con: 0, ent: 0}); // Copia inicial para mantener el estado previo
  
    setNumCard(updatedNumCards);
  };

  const countDecklist = (decklist: Decklist[]) => {
    return decklist.reduce((acc, deck) => acc + deck.count, 0)
  }

  const clearDecklist = () => {
    setDeckListMain([]);
    setDeckListLimbo([]);
  }

  const cardDetailMain = (index: number) => {
    const list = [...deckListMain];
    setDetalDecklistCards({deckList: list.reverse().map(deck => deck.card), index: index});
  }

  const cardDetailLimbo = (index: number) => {
    const list = [...deckListLimbo];
    setDetalDecklistCards({deckList: list.reverse().map(deck => deck.card), index: index});
  }

  const importDeck = () => {
    
    if(deck) {
      const test: Decklist[] = [];
      const test2: Decklist[] = [];

      deck.map(c => { if(c.card.types.filter(type => type.name === "Limbo").length === 0) { test.push(c) } else { test2.push(c)}})
      console.log(test, test2);  
      console.log(test.reduce((acc, deck) => acc + deck.count, 0));
      if(test.reduce((acc, deck) => acc + deck.count, 0) <= 40) {
        setDeckListMain([...test]);
      }

      if(test2.reduce((acc, deck) => acc + deck.count, 0) <= 6) {
        setDeckListLimbo([...test2]);
      }

    }
  }

  useEffect(() => {
    importDeck();
  }, []);

  useEffect(() => {
     countCardsTypes()
  }, [deckListMain])
  

  return (
    <div className="grid grid-cols-4 ">
      <div className="col-span-2 lg:col-span-3">
        <CardFinderLab propertiesCards={propertiesCards}/>
        <CardGrid cards={cards} addCard={addCard}/>
      </div>
      <div className="fixed bg-gray-200 right-0 transition-all w-1/2 md:px-4 py-2 h-screen lg:w-1/4"
      >
        <OptionsDeckCreator 
          deckListMain={deckListMain} 
          deckListLimbo={deckListLimbo} 
          clearDecklist={clearDecklist}
        />
        <div className="overflow-auto h-cal-200">
          
          <div className="border-b-2 bg-yellow-500 mx-1 px-1.5 py-1 rounded-lg">
            <h3 className="font-bold ml-2 text-black">{`${countDecklist(deckListLimbo)} Mazo de Limbo`}</h3>
            {
              deckListLimbo.slice().reverse().map( (deck, index) => (
                  <CardItemDeckList 
                    key={deck.card.id+index} 
                    card={deck.card} 
                    count={deck.count} 
                    index={index}
                    dropCard={dropCard} 
                    addCard={addCard}
                    detailCard={cardDetailLimbo}
                  />
              ))
            }
          </div>
          <div className="px-1.5 rounded-lg">
            <ul className="flex flex-row bg-gray-900 p-1 rounded-md mb-1 text-white">
              <li className="mr-2"><span className="font-bold ml-2">T:</span> {countDecklist(deckListMain)}</li>
              <li className="mr-2"><span className="font-bold text-red-600">U:</span> {numCards.und}</li>
              <li className="mr-2"><span className="font-bold text-purple-700">C:</span> {numCards.con}</li>
              <li className="mr-2"><span className="font-bold text-gray-400">A:</span> {numCards.arm}</li>
              <li className="mr-2"><span className="font-bold text-yellow-500">E:</span> {numCards.ent}</li>
            </ul>
            {
              deckListMain.slice().reverse().map( (deck, index) => (
                <CardItemDeckList 
                  key={deck.card.id+index} 
                  card={deck.card} 
                  count={deck.count} 
                  index={index}
                  dropCard={dropCard} 
                  addCard={addCard} 
                  detailCard={cardDetailMain}
                />
              ))
            }
          </div>              
        </div>
        
      </div>
      {isCardDetailOpen && (
      <CardDetail {...detalDecklistCards}/>
      )}      
    </div>
  )
}
