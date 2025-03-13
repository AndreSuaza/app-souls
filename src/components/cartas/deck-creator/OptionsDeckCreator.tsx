'use client';

import { Card } from "@/interfaces";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    IoImageOutline,
    IoLogoUsd,
    IoShareSocialOutline,
    IoTrashOutline,
} from "react-icons/io5";
import { Decklistimage } from "../decklist-image/DecklistImage";
import { Modal } from "@/components/ui/modal/modal";
import Link from "next/link";

interface Decklist {
    count: number;
    card: Card;
}

interface Props {
    deckListMain: Decklist[];
    deckListLimbo: Decklist[];
    clearDecklist: () => void;
}

export const OptionsDeckCreator = ({
    deckListMain,
    deckListLimbo,
    clearDecklist,
}: Props) => {

    const [showDeckImage, setShowDeckImage] = useState(false);
    const [showSharedDeck, setSharedDeck] = useState(false);
    const [deckList, setDeckList] = useState("");

    const priceDeck = () => {
        const main = deckListMain.reduce(
            (acc, deck) => acc + deck.card.price[0].price * deck.count,
            0
        );
        const limbo = deckListLimbo.reduce(
            (acc, deck) => acc + deck.card.price[0].price * deck.count,
            0
        );

        return main + limbo;
    };

    const createCodeDeck = () => {
        let exportText = "";
        deckListMain.map(
            (deck) =>
                (exportText = exportText + deck.card.idd + "%2C" + deck.count + "%2C")
        );
        deckListLimbo.map(
            (deck) =>
                (exportText = exportText + deck.card.idd + "%2C" + deck.count + "%2C")
        );
        setDeckList('https://soulsinxtinction.com/laboratorio?decklist='+exportText);
        setSharedDeck(true);
    };

    const closeDeckImage = () => {
        setShowDeckImage(false);
    }

    return (
        <>
        <div className="grid grid-cols-3 md:grid-cols-8 gap-1 mb-1">

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
                title="Limpiar Mazo"
                onClick={clearDecklist}
            >
                <IoTrashOutline className="w-6 h-6 -mb-0.5" />
            </button>
            <span className="flex flex-row py-2 px-2 font-bold col-span-2">
                <IoLogoUsd className="w-6 h-6 -mb-0.5" /> {priceDeck()}
            </span>
            
        </div>
        { showDeckImage && 
            <div className="w-full overflow-auto">
            <Decklistimage maindeck={deckListMain} limbodeck={deckListLimbo} close={closeDeckImage}/>
            </div>
        }
        { showSharedDeck && 
            <Modal 
                className="top-0 left-0 flex justify-center bg-gray-100 z-20 transition-all md:w-1/3 md:left-1/3 md:h-2/5 md:top-28"
                close={() => setSharedDeck(false)}
            >
            <div className="overflow-auto w-full text-center">
                <div className=" text-gray-100 py-4 bg-slate-950"> 
                    <h1 className="font-bold text-4xl">Enlace de tu Mazo</h1>
                </div>
               <p className="font-bold text-lg mt-4">Comparte el Link de tu mazo con tus amigos.</p>
               <div className="border-2 bg-slate-200 p-4 m-4 font-bold  text-indigo-600 text-center">
                <Link href={deckList}>
                    <p className="break-words mx-4">{deckList}</p>
                </Link>
               </div>
            </div>
            </Modal>
        }
        
        </>
    );
};
