'use client';

import { Card } from "@/interfaces";
import { copyText, pasteText } from "@/utils";
import { useRouter } from "next/navigation";
import {
    IoDownloadOutline,
    IoImageOutline,
    IoLogoUsd,
    IoPushOutline,
    IoTrashOutline,
} from "react-icons/io5";

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

    const router = useRouter();

    const priceDeck = () => {
        const main = deckListMain.reduce(
            (acc, deck) => acc + deck.card.price * deck.count,
            0
        );
        const limbo = deckListLimbo.reduce(
            (acc, deck) => acc + deck.card.price * deck.count,
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
        copyText(exportText);
    };

    async function importCodeDeck() {
        const deck = await pasteText()
        router.push(`/laboratorio?decklist=${deck}`);
    }

    return (
        <div className="grid grid-cols-3 md:grid-cols-8 gap-1 mb-1">
            {/* <button className="btn-short" title="Mazo de apoyo">
                <IoSwapHorizontalSharp className="text-indigo-600 w-6 h-6 -mb-0.5"/>
            </button> */}

            <button
                className="btn-short text-center"
                title="Importar Mazo"
                onClick={importCodeDeck}
            >
                <IoDownloadOutline className="w-6 h-6 -mt-0.5" />
            </button>
       
            <button
                className="btn-short"
                title="Exportar Mazo"
                onClick={createCodeDeck}
            >
                <IoPushOutline className="w-6 h-6 -mb-0.5" />
            </button>
            <button
                className="btn-short"
                title="Limpiar Mazo"
                onClick={clearDecklist}
            >
                <IoTrashOutline className="w-6 h-6 -mb-0.5" />
            </button>
            <button className="btn-short" title="Exportar Imagen">
                <IoImageOutline className="w-6 h-6 -mb-0.5" />
            </button>
            <span className="flex flex-row py-2 px-2 font-bold col-span-2">
                <IoLogoUsd className="w-6 h-6 -mb-0.5" /> {priceDeck()}
            </span>
        </div>
    );
};
