"use client";

import { Card } from "@/interfaces";
import { useState } from "react";
import {
  IoCopyOutline,
  IoGrid,
  IoHandRightOutline,
  IoImageOutline,
  IoListSharp,
  IoShareSocialOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { Modal, Decklistimage, SaveDeckForm } from "@/components";
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
  viewList,
}: Props) => {
  const [showDeckImage, setShowDeckImage] = useState(false);
  const [showSaveDeck, setShowSaveDeck] = useState(false);
  const [showSharedDeck, setSharedDeck] = useState(false);
  const [showHandTest, setShowHandTest] = useState(false);
  const [deckList, setDeckList] = useState("");
  const [copyState, setCopyState] = useState(false);
  const [mazoTest, setMazoText] = useState<Card[]>([]);

  const copyToClipboard = () => {
    setCopyState(true);
    navigator.clipboard.writeText(deckList);
  };

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

  const deckListText = () => {
    // Función auxiliar para convertir una lista en string
    const formatDeckList = (deckList: typeof deckListMain) =>
      deckList.map((deck) => `${deck.card.idd}%2C${deck.count}%2C`).join("");

    // Construir cada sección
    const exportText =
      formatDeckList(deckListMain) + formatDeckList(deckListLimbo);
    const exportSide = formatDeckList(deckListSide);

    // Construir URL final
    return `https://soulsinxtinction.com/laboratorio?decklist=${exportText}|${exportSide}`;
  };

  const deckImage = () => {
    if (deckListMain.length > 0) {
      return deckListMain[0].card.code + deckListMain[0].card.idd;
    }

    return "";
  };

  const createCodeDeck = () => {
    // Actualizar estados
    setDeckList(deckListText);
    setCopyState(false);
    setSharedDeck(true);
  };

  const shuffleDeck = () => {
    const cards = deckListMain.map((card) => card.card);
    setMazoText(cards.sort(() => 0.5 - Math.random()));
  };

  const handTest = () => {
    shuffleDeck();
    setShowHandTest(true);
  };

  const closeDeckImage = () => {
    setShowDeckImage(false);
  };

  const actionButtonClass =
    "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-purple-400 hover:text-purple-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:text-purple-300";

  const whatsappShareLink = deckList
    ? `https://wa.me/?text=${encodeURIComponent(deckList)}`
    : "https://wa.me/";

  return (
    <>
      <div className="grid grid-cols-4 gap-2 mb-3 md:grid-cols-8">
        {/* {session?.user && 
            <button
                className="btn-short"
                title="Nuevo Mazo"
                onClick={saveDeck}
            >
                <IoCreateOutline className="w-6 h-6 -mb-0.5" />
            </button>
            }

            {session?.user && 
            <button
                className="btn-short"
                title="Guardar Mazo"
                onClick={saveDeck}
            >
                <IoSaveOutline className="w-6 h-6 -mb-0.5" />
            </button>
            } */}

        <button
          className={actionButtonClass}
          title="Cambiar Vista del Mazo"
          onClick={changeViewList}
        >
          {viewList ? (
            <IoListSharp className="w-6 h-6 -mb-0.5 text-indigo-600" />
          ) : (
            <IoGrid className="w-6 h-6 -mb-0.5 text-indigo-600" />
          )}
        </button>

        <button
          className={actionButtonClass}
          title="Exportar Mazo"
          onClick={createCodeDeck}
        >
          <IoShareSocialOutline className="w-6 h-6 -mb-0.5" />
        </button>

        <button
          className={actionButtonClass}
          title="Exportar Imagen"
          onClick={() => setShowDeckImage(true)}
        >
          <IoImageOutline className="w-6 h-6 -mb-0.5" />
        </button>
        <button
          className={actionButtonClass}
          title="Prueba Manos"
          onClick={handTest}
        >
          <IoHandRightOutline className="w-6 h-6 -mb-0.5" />
        </button>
        <button
          className={actionButtonClass}
          title="Limpiar Mazo"
          onClick={clearDecklist}
        >
          <IoTrashOutline className="w-6 h-6 -mb-0.5" />
        </button>
        {/* <span className="flex flex-row py-2 px-2 font-bold col-span-2">
                <IoLogoUsd className="w-6 h-6 -mb-0.5" /> {priceDeck()}
            </span> */}
      </div>
      {showDeckImage && (
        <div className="w-full overflow-auto">
          <Decklistimage
            maindeck={deckListMain}
            limbodeck={deckListLimbo}
            close={closeDeckImage}
          />
        </div>
      )}
      {showSharedDeck && (
        <Modal
          className="top-6 left-1/2 w-[92%] max-w-xl -translate-x-1/2 rounded-lg border border-slate-200 bg-white shadow-2xl transition-all dark:border-tournament-dark-border dark:bg-tournament-dark-surface md:top-24 overflow-hidden"
          close={() => setSharedDeck(false)}
        >
          <div className="flex max-h-[80vh] w-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-2xl">
                Enlace de tu mazo
              </h1>
            </div>
            <div className="flex flex-col gap-4 px-5 pb-6 pt-5 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 sm:text-base">
                Comparte el enlace de tu mazo con tus amigos.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500"
                  onClick={copyToClipboard}
                >
                  <IoCopyOutline className="h-5 w-5" />
                  Copiar enlace
                </button>
                <Link
                  href={whatsappShareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-500 hover:text-white dark:border-emerald-400 dark:text-emerald-300"
                >
                  <FaWhatsapp className="h-5 w-5" />
                  Compartir en WhatsApp
                </Link>
              </div>
              {copyState && (
                <p className="text-sm font-semibold text-lime-600 dark:text-lime-400">
                  ¡Tu estrategia está lista! El mazo fue copiado al
                  portapapeles.
                </p>
              )}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200">
                <Link href={deckList} className="break-words">
                  {deckList}
                </Link>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {showHandTest && (
        <Modal
          className="top-6 left-1/2 w-[94%] max-w-4xl -translate-x-1/2 rounded-lg border border-slate-200 bg-white shadow-2xl transition-all dark:border-tournament-dark-border dark:bg-tournament-dark-surface md:top-20 overflow-hidden"
          close={() => setShowHandTest(false)}
        >
          <div className="flex max-h-[80vh] w-full flex-col overflow-hidden text-center">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                Prueba las manos de tu mazo
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-2 px-5 pb-6 pt-6 md:grid-cols-6">
              {mazoTest.slice(0, 6).map((card) => (
                <div key={card.id}>
                  <Image
                    width={500}
                    height={718}
                    src={`/cards/${card.code}-${card.idd}.webp`}
                    alt={card.name}
                    title={card.name}
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                    placeholder="blur"
                    className="rounded-lg drop-shadow-md"
                  />
                </div>
              ))}
            </div>

            <div className="px-5 pb-6">
              <button
                className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500"
                onClick={shuffleDeck}
              >
                Volver a robar cartas
              </button>
            </div>
          </div>
        </Modal>
      )}
      {showSaveDeck && (
        <Modal
          className="top-0 left-0 flex justify-center bg-gray-100 z-20 transition-all w-full md:w-1/3 md:left-1/3 md:top-28"
          close={() => setShowSaveDeck(false)}
        >
          <div className="overflow-auto w-full text-center">
            <div className=" text-gray-100 py-4 bg-slate-950">
              <h1 className="font-bold text-2xl md:text-2xl uppercase">
                Crear Mazo
              </h1>
            </div>
            <SaveDeckForm deck={deckListText()} imgDeck={deckImage()} />
          </div>
        </Modal>
      )}
    </>
  );
};
