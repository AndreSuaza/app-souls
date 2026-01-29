"use client";

import { Card, ArchetypeOption } from "@/interfaces";
import { useState } from "react";
import {
  IoCopyOutline,
  IoHandRightOutline,
  IoImageOutline,
  IoShareSocialOutline,
  IoCreateOutline,
  IoSaveOutline,
} from "react-icons/io5";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { RiFullscreenExitLine, RiFullscreenLine } from "react-icons/ri";
import { RiEraserLine } from "react-icons/ri";
import { Modal, Decklistimage, SaveDeckForm } from "@/components";
import Link from "next/link";
import Image from "next/image";
import { useAlertConfirmationStore } from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Decklist {
  count: number;
  card: Card;
}

interface Props {
  deckListMain: Decklist[];
  deckListLimbo: Decklist[];
  deckListSide: Decklist[];
  clearDecklist: () => void;
  isFinderCollapsed: boolean;
  onToggleFinderCollapse: () => void;
  showSaveControls?: boolean;
  editDeckUrl?: string;
  cloneDeckUrl?: string;
  hasSession?: boolean;
  loginCallbackUrl?: string;
  archetypes?: ArchetypeOption[];
  showFullscreenToggle?: boolean;
  showClearDeck?: boolean;
  showSaveButton?: boolean;
  showEditButton?: boolean;
  showCloneButton?: boolean;
}

export const OptionsDeckCreator = ({
  deckListMain,
  deckListLimbo,
  deckListSide,
  clearDecklist,
  isFinderCollapsed,
  onToggleFinderCollapse,
  showSaveControls = false,
  editDeckUrl,
  cloneDeckUrl,
  hasSession = false,
  loginCallbackUrl,
  archetypes = [],
  showFullscreenToggle = true,
  showClearDeck = true,
  showSaveButton = true,
  showEditButton = true,
  showCloneButton = false,
}: Props) => {
  const [showDeckImage, setShowDeckImage] = useState(false);
  const [showSaveDeck, setShowSaveDeck] = useState(false);
  const [showSharedDeck, setSharedDeck] = useState(false);
  const [showHandTest, setShowHandTest] = useState(false);
  const [deckList, setDeckList] = useState("");
  const [copyState, setCopyState] = useState(false);
  const [mazoTest, setMazoText] = useState<Card[]>([]);
  const openAlertConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const mainDeckCount = deckListMain.reduce(
    (acc, deck) => acc + deck.count,
    0,
  );

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

  const handleClearDecklist = () => {
    // Evita limpiezas accidentales del mazo al confirmar la accion.
    openAlertConfirmation({
      text: "¿Deseas limpiar el mazo?",
      description: "Se eliminaran todas las cartas del mazo actual.",
      action: async () => {
        clearDecklist();
        return true;
      },
    });
  };

  const handleOpenSave = () => {
    if (!hasSession) {
      const query = searchParams?.toString();
      const currentUrl = loginCallbackUrl
        ? loginCallbackUrl
        : query
          ? `${pathname}?${query}`
          : pathname;
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }
    setShowSaveDeck(true);
  };

  const closeDeckImage = () => {
    setShowDeckImage(false);
  };

  const actionButtonClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-purple-400 hover:text-purple-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:text-purple-300";
  const primaryActionButtonClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-amber-100 p-2 text-amber-700 shadow-sm transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-amber-400/10 dark:text-amber-300";
  const shareIconButtonClass =
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 shadow-sm transition hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200";

  const whatsappShareLink = deckList
    ? `https://wa.me/?text=${encodeURIComponent(deckList)}`
    : "https://wa.me/";
  const facebookShareLink = deckList
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        deckList,
      )}`
    : "https://www.facebook.com/sharer/sharer.php?u=";
  const xShareLink = deckList
    ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(deckList)}`
    : "https://twitter.com/intent/tweet";

  return (
    <>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap gap-1 sm:gap-2">
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

          {showFullscreenToggle && (
            <button
              className={primaryActionButtonClass}
              title={
                isFinderCollapsed
                  ? "Salir de pantalla completa de mazos"
                  : "Pantalla completa de mazos"
              }
              onClick={onToggleFinderCollapse}
            >
              {isFinderCollapsed ? (
                <RiFullscreenExitLine className="h-4 w-4 sm:h-6 sm:w-6" />
              ) : (
                <RiFullscreenLine className="h-4 w-4 sm:h-6 sm:w-6" />
              )}
            </button>
          )}

          <button
            className={actionButtonClass}
            title="Exportar Mazo"
            onClick={createCodeDeck}
          >
            <IoShareSocialOutline className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          <button
            className={actionButtonClass}
            title="Exportar Imagen"
            onClick={() => setShowDeckImage(true)}
          >
            <IoImageOutline className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <button
            className={actionButtonClass}
            title="Prueba Manos"
            onClick={handTest}
          >
            <IoHandRightOutline className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          {showClearDeck && (
            <button
              className={actionButtonClass}
              title="Limpiar Mazo"
              onClick={handleClearDecklist}
            >
              <RiEraserLine className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          )}
          {/* <span className="flex flex-row py-2 px-2 font-bold col-span-2">
                <IoLogoUsd className="w-6 h-6 -mb-0.5" /> {priceDeck()}
            </span> */}
        </div>
        {showSaveControls && (
          <div className="flex items-center gap-2 h-full">
            {showEditButton && editDeckUrl && (
              <Link
                href={editDeckUrl}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-600 px-3 text-xs font-semibold leading-none text-white shadow-sm transition hover:bg-blue-500 dark:border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-200"
              >
                Editar
                <IoCreateOutline className="h-4 w-4" />
              </Link>
            )}
            {showCloneButton && cloneDeckUrl && (
              <Link
                href={cloneDeckUrl}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-purple-200 bg-purple-600 px-3 text-xs font-semibold leading-none text-white shadow-sm transition hover:bg-purple-500 dark:border-purple-500/40 dark:bg-purple-500/20 dark:text-purple-200"
              >
                Clonar
                <IoCopyOutline className="h-4 w-4" />
              </Link>
            )}
            {showSaveButton && (
              <button
                type="button"
                onClick={handleOpenSave}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-600 px-3 text-xs font-semibold leading-none text-white shadow-sm transition hover:bg-emerald-500 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-200"
              >
                Guardar
                <IoSaveOutline className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
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
          className="left-1/2 top-1/2 w-[92%] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white shadow-2xl transition-all dark:border-tournament-dark-border dark:bg-tournament-dark-surface overflow-hidden"
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
              <div className="flex flex-col items-center justify-center gap-3">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500"
                  onClick={copyToClipboard}
                >
                  <IoCopyOutline className="h-5 w-5" />
                  Copiar enlace
                </button>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href={whatsappShareLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Compartir en WhatsApp"
                    aria-label="Compartir en WhatsApp"
                    className={shareIconButtonClass}
                  >
                    <FaWhatsapp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </Link>
                  <Link
                    href={facebookShareLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Compartir en Facebook"
                    aria-label="Compartir en Facebook"
                    className={shareIconButtonClass}
                  >
                    <FaFacebookF className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </Link>
                  <Link
                    href={xShareLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Compartir en X"
                    aria-label="Compartir en X"
                    className={shareIconButtonClass}
                  >
                    <FaXTwitter className="h-5 w-5 text-slate-900 dark:text-white" />
                  </Link>
                </div>
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
          className="left-1/2 top-1/2 w-[94%] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white shadow-2xl transition-all dark:border-tournament-dark-border dark:bg-tournament-dark-surface overflow-hidden"
          close={() => setShowHandTest(false)}
        >
          <div className="flex max-h-[80vh] w-full flex-col overflow-hidden text-center">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                Prueba las manos de tu mazo
              </h1>
            </div>

            <div className="px-5 pb-6 pt-6">
              {mazoTest.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 py-10 text-sm font-semibold text-slate-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200">
                  No hay cartas en el mazo para mostrar una mano.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
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
              )}
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
          className="left-1/2 top-1/2 w-[92%] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white shadow-2xl transition-all dark:border-tournament-dark-border dark:bg-tournament-dark-surface overflow-hidden"
          close={() => setShowSaveDeck(false)}
        >
          <div className="flex max-h-[80vh] w-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-2xl">
                Guardar mazo
              </h1>
            </div>
            <div className="overflow-auto">
              <SaveDeckForm
                deck={deckListText()}
                imgDeck={deckImage()}
                archetypes={archetypes}
                mainDeckCount={mainDeckCount}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
