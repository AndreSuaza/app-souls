"use client";

import { Card, ArchetypeOption, Deck } from "@/interfaces";
import { useMemo, useState } from "react";
import {
  IoCopyOutline,
  IoHandRightOutline,
  IoImageOutline,
  IoLibraryOutline,
  IoShareSocialOutline,
  IoCreateOutline,
  IoSaveOutline,
  IoTrash,
} from "react-icons/io5";
import { VscSaveAll } from "react-icons/vsc";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { RiFullscreenExitLine, RiFullscreenLine } from "react-icons/ri";
import { RiEraserLine } from "react-icons/ri";
import { Modal, Decklistimage, SaveDeckForm } from "@/components";
import { UserDeckLibrary } from "@/components/mazos/deck-library/UserDeckLibrary";
import Link from "next/link";
import Image from "next/image";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  deleteDeckAction,
  getUserDecksFilteredAction,
  saveDeck,
} from "@/actions";

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
  showDeleteButton?: boolean;
  deckId?: string;
  showUserDecksButton?: boolean;
  deckData?: Deck | null;
  isOwnerDeck?: boolean;
  archetypeName?: string | null;
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
  showDeleteButton = false,
  deckId,
  showUserDecksButton = false,
  deckData,
  isOwnerDeck = false,
  archetypeName,
}: Props) => {
  const [showDeckImage, setShowDeckImage] = useState(false);
  const [showSaveDeck, setShowSaveDeck] = useState(false);
  const [showSharedDeck, setSharedDeck] = useState(false);
  const [showHandTest, setShowHandTest] = useState(false);
  const [showUserDecks, setShowUserDecks] = useState(false);
  const [saveMode, setSaveMode] = useState<"create" | "edit" | "clone">(
    "create",
  );
  const [saveInitialValues, setSaveInitialValues] = useState<{
    name?: string;
    description?: string | null;
    isPrivate?: boolean;
  } | null>(null);
  const [deckList, setDeckList] = useState("");
  const [copyState, setCopyState] = useState(false);
  const [mazoTest, setMazoText] = useState<Card[]>([]);
  const openAlertConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const SIN_ARQUETIPO_ID = "67c5d1595d56151173f8f23b";

  const archetypeIdByName = useMemo(() => {
    const map = new Map<string, string>();
    archetypes.forEach((item) => {
      const name = item.name?.trim().toLowerCase();
      if (name && item.id) {
        map.set(name, item.id);
      }
    });
    return map;
  }, [archetypes]);

  const resolvedArchetypeId = useMemo(() => {
    const allCards = [...deckListMain, ...deckListLimbo, ...deckListSide];
    let total = 0;
    let noArchetypeCount = 0;
    const counts: Record<string, number> = {};

    const resolveCardArchetypeId = (card: Card) => {
      const entry = card.archetypes.find((arch) => {
        const name = arch.name?.trim();
        return Boolean(name);
      });
      if (!entry) return undefined;
      if (entry.id) return entry.id;
      const name = entry.name?.trim().toLowerCase();
      if (name) return archetypeIdByName.get(name);
      return undefined;
    };

    allCards.forEach((deckItem) => {
      const count = deckItem.count;
      total += count;
      const archetypeId = resolveCardArchetypeId(deckItem.card);
      if (!archetypeId) {
        noArchetypeCount += count;
        return;
      }
      counts[archetypeId] = (counts[archetypeId] ?? 0) + count;
    });

    if (total === 0) return SIN_ARQUETIPO_ID;
    if (noArchetypeCount / total > 0.5) return SIN_ARQUETIPO_ID;

    let maxId = "";
    let maxCount = -1;
    Object.entries(counts).forEach(([id, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxId = id;
      }
    });

    return maxId || SIN_ARQUETIPO_ID;
  }, [deckListMain, deckListLimbo, deckListSide, archetypeIdByName]);

  const resolvedArchetypeName = useMemo(() => {
    // Prioriza el arquetipo derivado de las cartas cuando el deck recien creado aun no carga la relacion.
    const found = archetypes.find((item) => item.id === resolvedArchetypeId);
    const candidate = found?.name ?? archetypeName ?? "";
    return candidate.trim().length > 0 ? candidate : "Sin arquetipo";
  }, [archetypes, resolvedArchetypeId, archetypeName]);

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
    // Funcion auxiliar para convertir una lista en string
    const formatDeckList = (deckList: typeof deckListMain) =>
      deckList.map((deck) => `${deck.card.idd}%2C${deck.count}%2C`).join("");

    // Construir cada seccion
    const exportText =
      formatDeckList(deckListMain) + formatDeckList(deckListLimbo);
    const exportSide = formatDeckList(deckListSide);

    return `${exportText}|${exportSide}`;
  };

  const deckShareUrl = () => {
    const deckCode = deckListText();
    return `https://soulsinxtinction.com/laboratorio?decklist=${deckCode}`;
  };

  const deckImage = () => {
    if (deckListMain.length > 0) {
      return `${deckListMain[0].card.code}-${deckListMain[0].card.idd}`;
    }

    return "";
  };

  const mainDeckCount = deckListMain.reduce((acc, deck) => acc + deck.count, 0);

  const createCodeDeck = () => {
    // Actualizar estados
    setDeckList(deckShareUrl());
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

  const handleOpenSave = async () => {
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

    const maxDecks = 12;
    try {
      // Evita abrir el modal si ya se alcanzó el límite de mazos sin torneo.
      const countResult = await getUserDecksFilteredAction({
        tournament: "without",
        archetypeId: "",
        date: "recent",
        likes: false,
        page: 1,
      });
      if (countResult.totalCount >= maxDecks) {
        showToast(
          "Ya alcanzaste el número máximo de mazos guardados permitidos (12).",
          "warning",
        );
        return;
      }
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo validar el límite de mazos.",
        "error",
      );
      return;
    }
    setSaveMode("create");
    setSaveInitialValues(null);
    setShowSaveDeck(true);
  };

  const handleDeleteDeck = () => {
    if (!deckData?.id) return;
    openAlertConfirmation({
      text: "¿Deseas eliminar este mazo?",
      description: "Esta acción eliminará el mazo permanentemente.",
      action: async () => {
        let isNavigating = false;
        showLoading("Eliminando mazo...");
        try {
          await deleteDeckAction({ deckId: deckData.id });
          // Limpia el mazo actual para que la vista no muestre cartas huérfanas.
          clearDecklist();
          showToast("Mazo eliminado correctamente.", "success");
          isNavigating = true;
          showLoading("Cargando mazo...");
          router.push("/laboratorio");
          return true;
        } catch (error) {
          showToast(
            error instanceof Error
              ? error.message
              : "No se pudo eliminar el mazo.",
            "error",
          );
          return false;
        } finally {
          if (!isNavigating) {
            hideLoading();
          }
        }
      },
    });
  };

  const openSaveModal = (mode: "edit" | "clone") => {
    setSaveMode(mode);
    setSaveInitialValues({
      name: deckData?.name ?? "",
      description: deckData?.description ?? "",
      isPrivate: deckData ? !deckData.visible : false,
    });
    setShowSaveDeck(true);
  };

  const handleQuickSave = () => {
    if (!deckData) return;
    openAlertConfirmation({
      text: "¿Deseas guardar los cambios del mazo?",
      description: "Se guardarán los cambios en las cartas actuales.",
      action: async () => {
        showLoading("Guardando mazo...");
        const resp = await saveDeck({
          name: deckData.name,
          description: deckData.description ?? "",
          archetypesId: resolvedArchetypeId,
          visible: deckData.visible ?? false,
          cardsNumber: mainDeckCount,
          deckList: deckListText(),
          imgDeck: deckImage(),
          deckId: deckData.id,
        });
        hideLoading();

        if (resp && resp.message) {
          showToast(resp.message, "warning");
          return false;
        }

        showToast("Mazo guardado correctamente.", "success");
        return true;
      },
    });
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

  const resolvedDeckId =
    saveMode === "clone"
      ? undefined
      : saveMode === "edit"
        ? deckData?.id
        : deckId;

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

          {hasSession && showUserDecksButton && (
            <button
              className={actionButtonClass}
              title="Ver mis mazos"
              onClick={() => setShowUserDecks(true)}
            >
              <IoLibraryOutline className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          )}

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
            {isOwnerDeck ? (
              <>
                {showDeleteButton && (
                  <button
                    type="button"
                    onClick={handleDeleteDeck}
                    title="Eliminar mazo"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-600 text-white shadow-sm transition hover:bg-red-500 dark:border-red-500/40 dark:bg-red-500/20 dark:text-red-200"
                  >
                    <IoTrash className="h-4 w-4" />
                  </button>
                )}
                {showEditButton && (
                  <button
                    type="button"
                    onClick={() => openSaveModal("edit")}
                    title="Editar mazo"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-600 text-white shadow-sm transition hover:bg-blue-500 dark:border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-200"
                  >
                    <IoCreateOutline className="h-4 w-4" />
                  </button>
                )}
                {showCloneButton && (
                  <button
                    type="button"
                    onClick={() => openSaveModal("clone")}
                    title="Clonar mazo"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-purple-200 bg-purple-600 text-white shadow-sm transition hover:bg-purple-500 dark:border-purple-500/40 dark:bg-purple-500/20 dark:text-purple-200"
                  >
                    <VscSaveAll className="h-4 w-4" />
                  </button>
                )}
                {showSaveButton && (
                  <button
                    type="button"
                    onClick={handleQuickSave}
                    title="Guardar cambios"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-500 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-200"
                  >
                    <IoSaveOutline className="h-4 w-4" />
                  </button>
                )}
              </>
            ) : (
              <>
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
              </>
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
                {saveMode === "edit"
                  ? "Editar mazo"
                  : saveMode === "clone"
                    ? "Clonar mazo"
                    : "Guardar mazo"}
              </h1>
            </div>
            <div className="overflow-auto">
              <SaveDeckForm
                deck={deckListText()}
                imgDeck={deckImage()}
                mainDeckCount={mainDeckCount}
                onClose={() => setShowSaveDeck(false)}
                deckId={resolvedDeckId}
                initialValues={saveInitialValues ?? undefined}
                mode={saveMode}
                autoArchetypeId={resolvedArchetypeId}
                archetypeName={resolvedArchetypeName}
              />
            </div>
          </div>
        </Modal>
      )}
      {showUserDecks && (
        <Modal
          className="left-1/2 top-1/2 w-[94%] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white shadow-2xl transition-all dark:border-tournament-dark-border dark:bg-tournament-dark-surface overflow-hidden"
          close={() => setShowUserDecks(false)}
        >
          <div className="flex max-h-[80vh] w-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-2xl">
                Mis mazos
              </h1>
            </div>
            <div className="overflow-auto px-5 pb-6 pt-5">
              <UserDeckLibrary
                archetypes={archetypes}
                hasSession={hasSession}
                onSelect={() => {
                  showLoading("Cargando mazo...");
                  setShowUserDecks(false);
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
