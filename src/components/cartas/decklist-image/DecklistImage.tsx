'use client';

import { Decklist } from "@/interfaces/decklist.interface";
import html2canvas from "html2canvas";
import Image from "next/image";
import { useRef, useState } from "react";
import { DeckImage } from "./DeckImage";
import { IoCloseOutline, IoDownloadOutline, IoLogoFacebook, IoLogoInstagram } from "react-icons/io5";


interface Props {
    maindeck: Decklist[],
    limbodeck?: Decklist[],
    sidedeck?: Decklist[],
    name?: string,
    player?: string,
    position?: string,
    close: () => void
}

export const Decklistimage = ({maindeck, limbodeck = [], name = "", player = "" , position = "", close}: Props) => {
    const divRef = useRef<HTMLDivElement>(null);

    const [nameDeck, setNameDeck] = useState(name)
    const [playerName, setPlayerName] = useState(player)
    const [top, setTop] = useState(position)

    const captureDivAsImage = async () => {
      if (!divRef.current) return;
  
      const canvas = await html2canvas(divRef.current, {scale: 1});
      const image = canvas.toDataURL("image/png");

      // Crear enlace de descarga
      const link = document.createElement("a");
      link.href = image;
      link.download = nameDeck+"-"+playerName;
      link.click();
    };
      

    return (
    <>

        <div
            className="fixed top-0 left-0 w-screen h-screen z-10 bg-black opacity-30"
        />

        <div 
            onClick={ close }
            className="fade-in fixed top-0 left-0 w-screen h-screen z-10 backdrop-filter backdrop-blur-sm"
        />

        
        <div className="text-white fixed top-0 left-0 ml-2 z-20 md:top-10 md:left-20 overflow-auto">
            <div className="mb-1 flex flex-row">
                <button onClick={close} className="flex flex-row font-semibold bg-indigo-500 px-2 py-0.5 mr-2">
                    <IoCloseOutline className="w-6 h-6" />
                </button>
                <button onClick={captureDivAsImage} className="flex flex-row font-semibold bg-indigo-500 px-2 py-0.5">
                <IoDownloadOutline className="w-6 h-6 -mt-0.5" /> descargar imagen</button>
                <input 
                    className="ml-2 px-2 text-black" 
                    type="text" 
                    placeholder="Nombre del mazo" 
                    onChange={(e) => setNameDeck(e.target.value)}
                    max={20}
                /> 
                <input 
                    className="ml-2 px-2 text-black" 
                    type="text" 
                    placeholder="Jugador" 
                    onChange={(e) => setPlayerName(e.target.value)}
                    max={20}
                />    
                <input 
                    className="ml-2 px-2 text-black" 
                    type="text" 
                    placeholder="Poposición" 
                    onChange={(e) => setTop(e.target.value)}
                    max={20}
                /> 
            </div>
            <div ref={divRef} className="w-[1080px] bg-[url(/bg-cardlist.webp)] bg-center bg-cover flex flex-row ">
                <div className="w-full  min-h-[400px] p-4">
                    <DeckImage decklist={maindeck} title="mazo principal" /> 
                    <DeckImage decklist={limbodeck} title="mazo limbo"/>
                </div> 
                <div className="relative bg-black bg-opacity-40 text-sm w-1/4 ml-2 p-4">
                    <div className="relative w-44 h-52 m-auto">
                    <Image 
                        fill
                        src='/logo-six.webp' 
                        alt="Logo Souls In Xtinction" 
                        title="Souls In Xtinction"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                        placeholder="blur"
                        className="absolute"
                    />
                    </div>
                    <div className="absolute top-1/3">
                        <p className="font-bold uppercase text-xl">{playerName}</p>
                        <p className="font-bold uppercase"><i>{top}</i></p>
                        <p className="font-bold uppercase mb-4"><i>Mazo: {nameDeck}</i></p>
                    </div>
                    <div className="absolute bottom-0 mb-6" >
                        <p className="flex flex-row mb-2"><IoLogoInstagram className="w-6 h-6 mr-1 mb-1"/> /soulsinxtinction</p>
                        <p className="flex flex-row"><IoLogoFacebook className="w-6 h-6 mr-1 mb-1"/> /soulsinxtinction</p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
