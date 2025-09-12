'use client';

import { Card } from "@/interfaces";
import { useState } from "react";
import {
    IoCopyOutline,
    IoGrid,
    IoHandRightOutline,
    IoImageOutline,
    IoListSharp,
    // IoLogoUsd,
    IoShareSocialOutline,
    IoTrashOutline,
} from "react-icons/io5";
import { Decklistimage } from "../decklist-image/DecklistImage";
import { Modal } from "@/components/ui/modal/modal";
import Link from "next/link";
import Image from "next/image";

interface Decklist {
    count: number;
    card: Card;
}

interface Props {
    deckListMain: Decklist[];
    deckListLimbo: Decklist[];
    deckListSide: Decklist[];
    clearDecklist: () => void;
    changeViewList: () => void;
    viewList: boolean;
}

export const OptionsDeckCreator = ({
    deckListMain,
    deckListLimbo,
    deckListSide,
    clearDecklist,
    changeViewList,
    viewList
}: Props) => {

    const [showDeckImage, setShowDeckImage] = useState(false);
    const [showSharedDeck, setSharedDeck] = useState(false);
    const [showHandTest, setShowHandTest] = useState(false);
    const [deckList, setDeckList] = useState("");
    const [copyState, setCopyState] = useState(false);
    const [mazoTest, setMazoText] = useState<Card[]>([]); 

    const copyToClipboard = () => {
        setCopyState(true);
        navigator.clipboard.writeText(deckList);
    }

    // const priceDeck = () => {
    //     const main = deckListMain.reduce(
    //         (acc, deck) => acc + deck.card.price[0].price * deck.count,
    //         0
    //     );
    //     const limbo = deckListLimbo.reduce(
    //         (acc, deck) => acc + deck.card.price[0].price * deck.count,
    //         0
    //     );

    //     return main + limbo;
    // };

    const createCodeDeck = () => {
        // Función auxiliar para convertir una lista en string
        const formatDeckList = (deckList: typeof deckListMain) =>
            deckList.map(deck => `${deck.card.idd}%2C${deck.count}%2C`).join("");

        // Construir cada sección
        const exportText = formatDeckList(deckListMain) + formatDeckList(deckListLimbo);
        const exportSide = formatDeckList(deckListSide);

        // Construir URL final
        const url = `https://soulsinxtinction.com/laboratorio?decklist=${exportText}|${exportSide}`;

        // Actualizar estados
        setDeckList(url);
        setCopyState(false);
        setSharedDeck(true);
    };

    const shuffleDeck = () => {
        const cards = deckListMain.map(card =>  card.card)
        setMazoText(cards.sort(() => 0.5 - Math.random()));
    }  

    const handTest = () => {
        shuffleDeck();
        setShowHandTest(true);
    };

    const closeDeckImage = () => {
        setShowDeckImage(false);
    }

    return (
        <>
        <div className="grid grid-cols-3 md:grid-cols-8 gap-1 mb-2">


             <button
                className="btn-short"
                title="Cambiar Vista del Mazo"
                onClick={changeViewList}
            >
                {
                    viewList 
                    ? <IoListSharp className="w-6 h-6 -mb-0.5 text-indigo-600" />
                    : <IoGrid className="w-6 h-6 -mb-0.5 text-indigo-600" />
                }
                
            </button>

            <button
                className="btn-short"
                title="Exportar Mazo"
                onClick={createCodeDeck}
            >
                <IoShareSocialOutline className="w-6 h-6 -mb-0.5" />
            </button>
           
            <button className="btn-short" title="Exportar Imagen" onClick={() => setShowDeckImage(true)}>
                <IoImageOutline className="w-6 h-6 -mb-0.5" />
            </button>
            <button
                className="btn-short"
                title="Prueba Manos"
                onClick={handTest}
            >
                <IoHandRightOutline className="w-6 h-6 -mb-0.5" />
            </button>
            <button
                className="btn-short"
                title="Limpiar Mazo"
                onClick={clearDecklist}
            >
                <IoTrashOutline className="w-6 h-6 -mb-0.5" />
            </button>
            {/* <span className="flex flex-row py-2 px-2 font-bold col-span-2">
                <IoLogoUsd className="w-6 h-6 -mb-0.5" /> {priceDeck()}
            </span> */}
            
        </div>
        { showDeckImage && 
            <div className="w-full overflow-auto">
            <Decklistimage maindeck={deckListMain} limbodeck={deckListLimbo} close={closeDeckImage}/>
            </div>
        }
        { showSharedDeck && 
            <Modal 
                className="top-0 left-0 flex justify-center bg-gray-100 z-20 transition-all w-full md:w-1/3 md:left-1/3 md:h-2/5 md:top-28"
                close={() => setSharedDeck(false)}
            >
            <div className="overflow-auto w-full text-center">
                <div className=" text-gray-100 py-4 bg-slate-950"> 
                    <h1 className="font-bold text-2xl md:text-4xl">Enlace de tu Mazo</h1>
                </div>
               <p className="font-bold text-lg mt-4">Comparte el Link de tu mazo con tus amigos.</p>
               <button className="px-4 py-2 bg-indigo-600 text-white rounded-md mt-2" onClick={copyToClipboard}><div className="flex flex-row"><IoCopyOutline className="w-6 h-6 mr-2" />Copiar Mazo</div></button>
               {copyState && <p className="transition-transform text-lime-600 mt-2 font-bold px-5"> ¡Tu estrategia está lista! El mazo fue copiado al portapapeles.</p>}
               <div className="border-2 bg-slate-200 p-4 m-4 font-bold  text-indigo-600 text-center">
                <Link href={deckList}>
                    <p className="break-words mx-4">{deckList}</p>
                </Link>
               </div>
               
            </div>
            </Modal>
        }
        { showHandTest && 
            <Modal 
                className="top-0 left-0 flex justify-center bg-gray-100 z-20 transition-all w-full md:w-1/2 md:left-1/4 md:h-3/5 md:top-28"
                close={() => setShowHandTest(false)}
            >
            <div className="overflow-auto w-full text-center">
                <div className=" text-gray-100 py-4 bg-slate-950"> 
                    <h1 className="font-bold text-2xl md:text-2xl">Prueba las manos de tu mazo</h1>
                </div>

                <div className="grid lg:grid-cols-6 md:grid-cols-6 grid-cols-3 mt-12 mb-6 gap-1 mx-6">
                {mazoTest.slice(0, 6).map((card) => 
                    <div key={card.id}>
                        <Image 
                            width={500} 
                            height={718} 
                            src={`/cards/${card.code}-${card.idd}.webp`} 
                            alt={card.name} 
                            title={card.name}
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                            placeholder="blur" 
                            className="rounded drop-shadow-md m-auto sm:w-screen mx-2"
                            />
                    </div>  
                )}
                </div>

              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md mb-6" onClick={shuffleDeck}>Volver a robar cartas</button>
            </div>
            </Modal>
        }
        
        </>
    );
};
