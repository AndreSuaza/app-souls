'use client';

import type { Archetype, Card, Keyword, Rarity, Type } from "@/interfaces";
import { useCardDetailStore } from "@/store";
import Image from "next/image";
import { useState } from "react";
import { IoChevronBack, IoChevronForward, IoCloseOutline } from "react-icons/io5";

interface Props {
    deckList: Card[];
    index: number;
}


export const CardDetail = ({ deckList, index }: Props) => {

    const [card, setCard] = useState(deckList[index]);
    const [indexCard, setIndexCard] = useState(index);
    const isCardDetailOpen = useCardDetailStore( state => state.isCardDetailOpen);
    const closeCardDetail = useCardDetailStore( state => state.closeCardDetail );

    const forwardCard = () => {

        if(indexCard < deckList.length-1) {
            setIndexCard(indexCard+1);
            setCard(deckList[indexCard+1]);
        } else {
            setIndexCard(0);
            setCard(deckList[0]);
        } 
    }

    const backCard = () => {

        if(indexCard > 0) {
            setIndexCard(indexCard-1);
            setCard(deckList[indexCard-1]);
        } else {
            setIndexCard(deckList.length-1);
            setCard(deckList[deckList.length-1]);
        } 
    }

  return (
    <>
    {
        isCardDetailOpen && (
            <div
                className="fixed top-0 left-0 w-screen h-screen z-10 bg-black opacity-30"
            />
        )
    }
        
    {
        isCardDetailOpen && (
            <div 
                onClick={ closeCardDetail }
                className="fade-in fixed top-0 left-0 w-screen h-screen z-10 backdrop-filter backdrop-blur-sm"
            />
        )
    }
    <div className="fixed top-0 left-0 flex justify-center bg-gray-100 z-20 transition-all md:w-3/6 md:left-1/4 md:h-5/6 md:top-14">
         <IoCloseOutline 
            size={50}
            className="absolute top-3 right-5 cursor-pointer text-gray-100 bg-slate-950 hover:bg-indigo-600"
            onClick={ closeCardDetail }
        />
        <IoChevronForward 
            size={50}
            className="bg-slate-950 absolute cursor-pointer hover:bg-slate-950 text-gray-100 top-[400px] right-0 md:-right-10"
            onClick={ forwardCard }
        />
        <IoChevronBack  
            size={50}
            className="bg-slate-950 absolute cursor-pointer hover:bg-slate-950 text-gray-100 top-[400px] left-0 md:-left-10"
            onClick={ backCard }
        />
        <div className="overflow-auto scroll-smooth w-screen pb-4 xl:grid xl:grid-cols-2">
            <div className="text-center text-gray-100 py-4 mb-4 col-span-3 bg-slate-950"> 
                <h1 className="font-bold text-4xl">{card.name}</h1>
            </div>
            <div className="px-4">

                <Image
                    src={`/cards/${card.code}-${card.idd}.webp`}
                    alt={card.name}
                    className='w-full object-cover rounded-2xl'
                    width={500}
                    height={718}
                />
            </div>
            <div className="px-4">
                <table className="table-auto text-left w-full mt-6 ">
                    <tbody>
                        <tr className="border-b">
                        <th>Tipo</th>
                        <td className="py-3">{card?.types.map((type: Type, i ) => {return i > 0 ? ', '+type.name : type.name})}</td>
                        <th>Coste</th>
                        <td className="py-3">{card?.cost}</td>
                        </tr>
                        <tr className="border-b">
                        <th>Fuerza</th>
                        <td className="py-3">{card?.force}</td>
                        <th>Defensa</th>
                        <td className="py-3">{card?.defense}</td>
                        </tr>
                        <tr className="border-b">
                        <th>Arqueotipo</th>
                        <td className="py-3">{card?.archetypes.map((archetype: Archetype, i: any) => {return i > 0 ? ', '+archetype.name : archetype.name})}</td>
                        <th>Palabras Clave</th>
                        <td className="py-3">{card?.keywords.map((keyword: Keyword, i: any) => {return i > 0 ? ', '+keyword.name : keyword.name})}</td>
                        </tr>
                        <tr className="border-b">
                        <th>Rareza</th>
                        <td className="py-3">{card?.rarities.map((rarity: Rarity, i: any) => {return i > 0 ? ', '+rarity.name : rarity.name})}</td>
                        </tr>
                        <tr>
                        <th className="pt-2">Efecto</th>
                        </tr>
                        <tr className="border-b">
                        <td colSpan={4} className="pb-6 font-light">{card?.effect}</td>
                        </tr>
                        {/* <tr>
                        <th className="pt-2" colSpan={4}>Productos donde puedes encontrar esta carta.</th>
                        </tr>
                        <tr>
                        <td className="w-full py-3 max-h-40" colSpan={4}>
                            <ProductsByCard productsByCard={card?.products}/>
                        </td>
                        </tr> */}
                    </tbody>
                </table>
            </div>
        </div> 
    </div>
    </>
  )
}
