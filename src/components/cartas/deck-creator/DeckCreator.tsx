'use client';

import type { Card } from "@/interfaces";
import { useEffect, useState } from "react";
import { CardItemDeckList } from "@/components/cartas/card-grid/CardItemDeckList";
import { useCardDetailStore } from "@/store";
import { OptionsDeckCreator } from "./OptionsDeckCreator";
import { Decklist } from "@/interfaces/decklist.interface";
import { CardItemList } from "../card-grid/CardItemList";
import { CardFinder } from "../card-finder/card-finder";


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
    deck?: Decklist[];
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

export const DeckCreator = ({cards, propertiesCards, totalPages, deck}: Props) => {


  const [deckListMain, setDeckListMain] = useState<Decklist[]>([]);
  const [deckListLimbo, setDeckListLimbo] = useState<Decklist[]>([]);
  const [deckListApoyo, setDeckListApoyo] = useState<Decklist[]>([]);
  const [numCards, setNumCard] = useState({und: 0, arm: 0, con: 0, ent: 0}) 
  const [viewList, setViewList] = useState(false);
  const setDeckDetail = useCardDetailStore( state => state.setDeckDetail );

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

  // const dropCardSideDeck = (cardSeleted: Card) => {

  //   const result = dropCardDecklist(deckListApoyo, cardSeleted);
  //   if(result) { setDeckListApoyo(result); }
    
  // }

  const addCardSideDeck = (cardSeleted: Card) => {

    if(cardSeleted.types.filter(type => type.name === "Alma").length > 0) { return }
    if(cardSeleted.types.filter(type => type.name === "Ficha").length > 0) { return }
    if(deckListApoyo.reduce((acc, deck) => acc + deck.count, 0) > 9) return

    const result = addCardDecklist(deckListApoyo, cardSeleted);
    if(result) { setDeckListApoyo(result); }
  }

  const indexLimbo = (index: number) => {
    console.log(deckListMain.length + index);
    return deckListMain.length + index;
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

  const cardDetailMain = () => {
    const list = [...deckListMain, ...deckListLimbo, ...deckListApoyo];
    console.log(list);
    setDeckDetail(list.reverse().map(deck => deck.card))
  }

  const importDeck = () => {
    
    if(deck) {
      const test: Decklist[] = [];
      const test2: Decklist[] = [];

      deck.map(c => { if(c.card.types.filter(type => type.name === "Limbo").length === 0) { test.push(c) } else { test2.push(c)}})
 
      if(test.reduce((acc, deck) => acc + deck.count, 0) <= 40) {
        setDeckListMain([...test]);
      }

      if(test2.reduce((acc, deck) => acc + deck.count, 0) <= 6) {
        setDeckListLimbo([...test2]);
      }

    }
  }

  const changeViewList = () => {
    setViewList(!viewList)
  }

  useEffect(() => {
    importDeck();
  }, []);

  useEffect(() => {
     countCardsTypes()
  }, [deckListMain])
  

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 mb-6">
      <div className="">
       <CardFinder cards={cards} propertiesCards={propertiesCards} totalPage={totalPages} cols={2} addCard={addCard} addCardSidedeck={addCardSideDeck}/>
      </div>
      <div className="col-span-1 md:col-span-3 mt-6 mx-2"
      >
        <div className="flex mb-4">  
        <OptionsDeckCreator 
          deckListMain={deckListMain} 
          deckListLimbo={deckListLimbo} 
          clearDecklist={clearDecklist}
          changeViewList={changeViewList}
          viewList={viewList}
        />
        </div>
         
        <div className="border-2 p-2 rounded-xl shadow-md bg-slate-100">
            <div className="flex flex-col">
            <h2 className="bg-gray-400 px-2 py-1 rounded text-sm md:text-2xl uppercase font-bold mb-2 pr-6">Mazo Principal</h2>
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
               !viewList ? 
                <CardItemList 
                  key={deck.card.id+index} 
                  card={deck.card} 
                  count={deck.count} 
                  index={index}
                  dropCard={dropCard} 
                  addCard={addCard} 
                  detailCard={cardDetailMain}
                />
                :
                <CardItemDeckList
                  key={deck.card.id+index} 
                  card={deck.card} 
                  count={deck.count} 
                  index={index}
                  dropCard={dropCard} 
                  addCard={addCard} 
                  detailCard={cardDetailMain}
                />
                
              )
            }
            </div>

            <h2 className="bg-yellow-500 py-1 px-2 rounded text-sm md:text-2xl uppercase font-bold my-2 text-white">Mazo Limbo</h2>
      
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {
              deckListLimbo.slice().reverse().map( (deck, index) => 
               !viewList ? 
                <CardItemList 
                  key={deck.card.id+index} 
                  card={deck.card} 
                  count={deck.count} 
                  index={indexLimbo(index)}
                  dropCard={dropCard} 
                  addCard={addCard} 
                  detailCard={cardDetailMain}
                />
                :
                <CardItemDeckList
                  key={deck.card.id+index} 
                  card={deck.card} 
                  count={deck.count} 
                  index={indexLimbo(index)}
                  dropCard={dropCard} 
                  addCard={addCard} 
                  detailCard={cardDetailMain}
                />
                
              )
            }
            </div>

            {/* <h2 className="bg-indigo-500 py-1 px-2 rounded text-sm md:text-2xl uppercase font-bold my-2 text-white">Mazo Apoyo</h2>
      
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {
              deckListApoyo.slice().reverse().map( (deck, index) => 
               !viewList ? 
                <CardItemList 
                  key={deck.card.id+index} 
                  card={deck.card} 
                  count={deck.count} 
                  index={index}
                  dropCard={dropCardSideDeck} 
                  addCard={addCardSideDeck} 
                  detailCard={cardDetailMain}
                />
                :
                <CardItemDeckList
                  key={deck.card.id+index} 
                  card={deck.card} 
                  count={deck.count} 
                  index={index}
                  dropCard={dropCardSideDeck} 
                  addCard={addCardSideDeck} 
                  detailCard={cardDetailMain}
                />
                
              )
            }
            </div> */}
        </div>              
      </div>    
    </div>
  )
}
