"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import {
  IoAddOutline,
  IoImageOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { ButtonLogOut } from "../login/ButtonLogOut";
import { Modal } from "../ui/modal/modal";
import {
  getActiveTournament,
  getProfileTournament,
  updateUser,
} from "@/actions";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { useUserDecksStore } from "@/store";
import {
  type ActiveTournamentData,
  type TournamentSnapshot,
} from "@/interfaces";
import { ProfileCurrentTournament } from "./ProfileCurrentTournament";
import { ProfileTournamentHistory } from "./ProfileTournamentHistory";
import { UserDeckLibrary } from "../mazos/deck-library/UserDeckLibrary";

interface User {
  name?: string | null;
  lastname?: string | null;
  email?: string | null;
  nickname?: string | null;
  image?: string | null;
  role?: string | null;
  victoryPoints?: number | null;
}

// interface Archetype {
//   name: string| null;
// }

type Avatar = {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  isExclusive: boolean;
};

type TournamentStatus = "pending" | "in_progress" | "finished" | "cancelled";

type TournamentHistoryItem = {
  id: string;
  title: string;
  date: string;
  status: TournamentStatus;
  playersCount: number;
};

// interface Deck {
//   id: string;
//   name: string;
//   imagen: string;
//   cards: string;
//   likesCount: number;
//   createdAt: Date;
//   user: User;
//   archetype: Archetype;
// }

type TabKey = "current" | "history" | "selected" | "mazos";

interface Props {
  user: User;
  avatars: Avatar[];
  activeTournament: ActiveTournamentData | null;
  tournaments: TournamentHistoryItem[];
}

export const Pefil = ({
  user,
  avatars,
  activeTournament,
  tournaments,
}: Props) => {
  const InfoTooltip = ({ text }: { text: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const containerRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
      const media = window.matchMedia("(min-width: 1024px)");
      const update = () => setIsDesktop(media.matches);
      update();
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }, []);

    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (!containerRef.current) return;
        if (containerRef.current.contains(event.target as Node)) return;
        setIsOpen(false);
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
      <span ref={containerRef} className="relative inline-flex items-center">
        <button
          type="button"
          title={text}
          aria-label={text}
          // Permite abrir el tooltip en mobile; en desktop solo funciona el hover nativo del title.
          onClick={() => {
            if (isDesktop) return;
            setIsOpen((prev) => !prev);
          }}
          className="inline-flex cursor-pointer items-center justify-center text-slate-500 transition hover:text-purple-600 dark:text-slate-300"
        >
          <IoInformationCircleOutline className="h-4 w-4" />
        </button>
        {isOpen && (
          <span className="absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200">
            {text}
          </span>
        )}
      </span>
    );
  };
  // Mantiene el limite alineado con save-deck.action.ts para no ofrecer mas mazos de los permitidos.
  const MAX_USER_DECKS = 12;
  const [activeTournamentState, setActiveTournamentState] =
    useState<ActiveTournamentData | null>(activeTournament);
  const hasCurrentTournament = Boolean(
    activeTournamentState?.currentTournament,
  );
  const [activeTab, setActiveTab] = useState<TabKey>(
    user.role === "player"
      ? activeTournament
        ? "current"
        : "history"
      : "mazos",
  );
  const [selectedTournament, setSelectedTournament] =
    useState<TournamentSnapshot | null>(null);
  const [hasShownInProgressWarning, setHasShownInProgressWarning] =
    useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const [baseAvatar, setBaseAvatar] = useState(user.image ?? "");
  const [selectedAvatar, setSelectedAvatar] = useState(baseAvatar);
  const isAvatarChanged = selectedAvatar !== baseAvatar;

  useEffect(() => {
    const nextAvatar = user.image ?? "";
    setBaseAvatar(nextAvatar);
    setSelectedAvatar(nextAvatar);
  }, [user.image]);
  const showToast = useToastStore((state) => state.showToast);
  const openAlertConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const deleteDeck = useUserDecksStore((state) => state.deleteDeck);
  const deckFilters = useUserDecksStore((state) => state.filters);
  const setDeckFilters = useUserDecksStore((state) => state.setFilters);
  const fetchDecks = useUserDecksStore((state) => state.fetchDecks);
  const hasLoadedDecks = useUserDecksStore((state) => state.hasLoaded);
  const nonTournamentCount = useUserDecksStore(
    (state) => state.nonTournamentCount,
  );
  const { data: session, update } = useSession();
  const hasSession = Boolean(session?.user?.idd ?? user.email);
  const [deckRefreshToken, setDeckRefreshToken] = useState(0);

  const handleSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar.imageUrl);
    setShowAvatars(false);
  };

  const updateUserProfile = async () => {
    try {
      showLoading("Actualizando avatar...");
      await updateUser(selectedAvatar);
      // Sincroniza el avatar en la sesion para reflejarlo en el top menu.
      await update({ user: { image: selectedAvatar } });
      showToast("Avatar actualizado correctamente", "success");
      setBaseAvatar(selectedAvatar);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el avatar",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const handleDiscardAvatar = () => {
    setSelectedAvatar(baseAvatar);
  };

  const isPlayer = user.role === "player";
  const hasBaseTournament =
    Boolean(activeTournamentState?.currentTournament) ||
    Boolean(activeTournamentState?.lastTournament);
  const hasSelectedTournament = Boolean(selectedTournament);

  const tabs: TabKey[] = isPlayer
    ? hasBaseTournament
      ? ["current", "history"]
      : ["history"]
    : [];

  if (hasSelectedTournament) {
    tabs.push("selected");
  }
  tabs.push("mazos");

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (activeTab !== "mazos") return;
    // Forzamos un refresh discreto cada vez que se entra al tab de mazos.
    setDeckRefreshToken((prev) => prev + 1);
  }, [activeTab]);

  const handleHistorySelect = async (tournamentId: string) => {
    showLoading("Cargando torneo...");
    const currentTournamentId =
      activeTournamentState?.currentTournament?.tournament.id ?? null;
    const lastTournamentId =
      activeTournamentState?.lastTournament?.tournament.id ?? null;

    if (tournamentId === currentTournamentId) {
      setSelectedTournament(null);
      setActiveTab("current");
      hideLoading();
      return;
    }

    if (
      !activeTournamentState?.currentTournament &&
      tournamentId === lastTournamentId
    ) {
      setSelectedTournament(null);
      setActiveTab("current");
      hideLoading();
      return;
    }

    try {
      const tournament = await getProfileTournament({ tournamentId });
      setSelectedTournament(tournament);
      setActiveTab("selected");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "No se pudo cargar el torneo",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const handleRefreshTournament = async (tournamentId: string) => {
    showLoading("Actualizando torneo...");
    if (selectedTournament?.tournament.id === tournamentId) {
      try {
        const tournament = await getProfileTournament({ tournamentId });
        setSelectedTournament(tournament);
      } catch (error) {
        showToast(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el torneo",
          "error",
        );
      } finally {
        hideLoading();
      }
      return;
    }

    try {
      const refreshed = await getActiveTournament();
      setActiveTournamentState(refreshed);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el torneo",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const currentTabLabel = hasCurrentTournament
    ? "Torneo actual"
    : "Ultimo torneo";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-tournament-dark-bg dark:via-tournament-dark-muted-strong dark:to-tournament-dark-bg text-slate-900 dark:text-white overflow-hidden p-4">
      {/* Fondo */}
      {/* <div className="absolute inset-0 bg-[url('/images/fondo-souls.jpg')] bg-cover bg-center opacity-20 blur-sm"></div> */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-slate-100/80 to-slate-100/90 dark:from-black/70 dark:to-black/90"></div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-6xl bg-white/90 dark:bg-tournament-dark-surface/90 border border-slate-200 dark:border-tournament-dark-border rounded-2xl shadow-xl py-8 px-4 backdrop-blur-md flex flex-col items-center transition">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row items-center gap-8 w-full">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.35)] transition group-hover:scale-105">
              <Image
                className="rounded-lg"
                width={270}
                height={287}
                src={`/profile/${selectedAvatar || user.image}.webp`}
                alt="Carta Prime Wenddygo"
                title="Prime Wenddygo"
              />
            </div>
            <button
              onClick={() => setShowAvatars(true)}
              className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full text-xs hover:bg-purple-700 transition"
            >
              <IoImageOutline className="w-6 h-6" />
            </button>
          </div>

          {/* Info básica */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-300">
              {user.nickname}
            </h1>
            {/* <p className="text-gray-300 italic">No soy un mazo... soy un monstruo.</p> */}

            {/* Barra de experiencia */}
            {/* <div className="mt-4">
              <p className="text-sm text-gray-400 mb-1">Nivel 12</p>
              <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden border border-purple-700/50">
                <div className="bg-purple-500 h-full w-3/4 transition-all"></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">XP: 750 / 1000</p>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="bg-slate-50 dark:bg-tournament-dark-muted p-3 rounded-lg border border-tournament-dark-accent dark:border-tournament-dark-border">
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Nombre
                </p>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div className="bg-slate-50 dark:bg-tournament-dark-muted p-3 rounded-lg border border-tournament-dark-accent dark:border-tournament-dark-border">
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Apellido
                </p>
                <p className="font-semibold">{user.lastname}</p>
              </div>
              <div className="bg-slate-50 dark:bg-tournament-dark-muted p-3 rounded-lg border border-tournament-dark-accent dark:border-tournament-dark-border">
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Email
                </p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div className="bg-slate-50 dark:bg-tournament-dark-muted p-3 rounded-lg border border-tournament-dark-accent dark:border-tournament-dark-border">
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Puntos
                </p>
                <p className="font-semibold">{user.victoryPoints}</p>
              </div>
              {user.role && user.role !== "player" && (
                <div className="bg-slate-50 dark:bg-tournament-dark-muted p-3 rounded-lg border border-tournament-dark-accent dark:border-tournament-dark-border">
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Rol
                  </p>
                  <p className="font-semibold">{user.role}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {isAvatarChanged && (
          <div className="flex md:flex-row flex-col w-full justify-end gap-3 mt-6">
            <button
              onClick={handleDiscardAvatar}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted transition"
            >
              Descartar
            </button>
            <button
              onClick={updateUserProfile}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-white shadow-md shadow-purple-600/40 transition"
            >
              Guardar
            </button>
          </div>
        )}

        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="flex mt-10 border-b border-slate-200 dark:border-tournament-dark-border w-full justify-center md:justify-start">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-2 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300"
                }`}
              >
                {tab === "current"
                  ? currentTabLabel
                  : tab === "history"
                    ? "Historial de torneos"
                    : tab === "selected"
                      ? "Torneo"
                      : "Mis mazos"}
              </button>
            ))}
          </div>
        )}

        {/* Contenido */}
        <div className="mt-8 w-full">
          {isPlayer && activeTab === "current" && activeTournamentState && (
            <ProfileCurrentTournament
              data={activeTournamentState}
              hasShownInProgressWarning={hasShownInProgressWarning}
              onInProgressWarningShown={() =>
                setHasShownInProgressWarning(true)
              }
              onRefreshTournament={handleRefreshTournament}
              enableDeckAssociation
              hasSession={hasSession}
            />
          )}

          {isPlayer &&
            activeTab === "selected" &&
            activeTournamentState &&
            selectedTournament && (
              <ProfileCurrentTournament
                data={activeTournamentState}
                selectedTournament={selectedTournament}
                hasShownInProgressWarning={hasShownInProgressWarning}
                onInProgressWarningShown={() =>
                  setHasShownInProgressWarning(true)
                }
                onRefreshTournament={handleRefreshTournament}
                enableDeckAssociation
                hasSession={hasSession}
              />
            )}

          {isPlayer && activeTab === "history" && (
            <ProfileTournamentHistory
              tournaments={tournaments}
              onSelectTournament={handleHistorySelect}
            />
          )}

          {activeTab === "mazos" && (
            <UserDeckLibrary
              archetypes={[]}
              hasSession={hasSession}
              refreshToken={deckRefreshToken}
              headerContent={
                <div className="flex flex-wrap items-center gap-3">
                  {hasSession && hasLoadedDecks ? (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const tooltipText =
                          "La cantidad máxima de mazos permitidos es 12.";
                        const hasReachedMax =
                          nonTournamentCount >= MAX_USER_DECKS;
                        if (hasReachedMax) {
                          return (
                            <>
                              <button
                                type="button"
                                disabled
                                className="inline-flex h-10 items-center justify-center gap-1 sm:gap-2 rounded-lg border border-emerald-200 bg-emerald-600 px-1 sm:px-3 text-xs font-semibold leading-none text-white shadow-sm opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200"
                              >
                                <IoAddOutline className="h-4 w-4" />
                                Crear mazo
                              </button>
                              <InfoTooltip text={tooltipText} />
                            </>
                          );
                        }
                        return (
                          <>
                            <Link
                              href="/laboratorio"
                              className="inline-flex h-10 items-center justify-center gap-1 sm:gap-2 rounded-lg border border-emerald-200 bg-emerald-600 px-1 sm:px-3 text-xs font-semibold leading-none text-white shadow-sm transition hover:bg-emerald-500 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200"
                            >
                              <IoAddOutline className="h-4 w-4" />
                              Crear mazo
                            </Link>
                            <InfoTooltip text={tooltipText} />
                          </>
                        );
                      })()}
                    </div>
                  ) : null}
                  <div className="ml-auto flex flex-wrap gap-2">
                    {(
                      [
                        { value: "without", label: "Mazos" },
                        { value: "with", label: "Competitivos" },
                      ] as const
                    ).map((filter) => {
                      const isActive = deckFilters.tournament === filter.value;
                      return (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => {
                            const nextFilters = {
                              ...deckFilters,
                              tournament: filter.value,
                            };
                            setDeckFilters(nextFilters);
                            fetchDecks({
                              tournament: nextFilters.tournament,
                              archetypeId: nextFilters.archetypeId,
                              date: nextFilters.date,
                              likes: nextFilters.likes === "1",
                              page: 1,
                            });
                          }}
                          className={clsx(
                            "flex h-9 items-center justify-center rounded-lg px-2 sm:px-4 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-accent dark:hover:text-white",
                          )}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              }
              onDeleteDeck={(deckId) => {
                openAlertConfirmation({
                  text: "¿Deseas eliminar este mazo?",
                  description: "Esta acción eliminará el mazo permanentemente.",
                  action: async () => {
                    showLoading("Eliminando mazo...");
                    const success = await deleteDeck(deckId);
                    hideLoading();
                    if (success) {
                      showToast("Mazo eliminado correctamente.", "success");
                    } else {
                      showToast(
                        "No se pudo eliminar el mazo. Inténtalo de nuevo.",
                        "error",
                      );
                    }
                    return success;
                  },
                });
              }}
            />
          )}

          {/* {activeTab === "perfil" && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <StatCard label="Victorias" value="42" />
              <StatCard label="Derrotas" value="18" />
              <StatCard label="Torneos" value="9" />
            </div>
          )} */}

          {/* {activeTab === "mazos" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((m, i) => (
                <div
                  key={i}
                  className="bg-gray-800/70 p-5 rounded-xl border border-purple-600/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition"
                >
                  <h3 className="text-lg font-bold text-purple-400">{m.name}</h3>
                  <p className="text-sm text-gray-300">Arquetipo: {m.archetype.name}</p>
                  <button className="mt-4 w-full py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
                    Ver Detalles
                  </button>
                </div>
              ))}
            </div>
          )} */}

          {/* {activeTab === "torneos" && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-purple-600/40">
                <thead>
                  <tr className="bg-purple-800/30 text-purple-300 uppercase text-xs">
                    <th className="px-4 py-2 text-left">Torneo</th>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {torneos.map((t, i) => (
                    <tr
                      key={i}
                      className="border-t border-purple-700/30 hover:bg-purple-900/20 transition"
                    >
                      <td className="px-4 py-2">{t.nombre}</td>
                      <td className="px-4 py-2 text-center">{t.fecha}</td>
                      <td className="px-4 py-2 text-center text-purple-400 font-semibold">
                        {t.posicion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )} */}
        </div>

        {/* Botones */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <ButtonLogOut className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold shadow-md hover:shadow-red-500/50 transition text-white">
            Cerrar Sesión
          </ButtonLogOut>
        </div>
      </div>

      {showAvatars && (
        <Modal
          className="top-0 left-0 flex justify-center bg-slate-50 dark:bg-tournament-dark-bg z-20 transition-all w-full h-screen md:h-auto md:w-1/2 md:left-1/4 md:top-28"
          close={() => setShowAvatars(false)}
        >
          <div className="overflow-auto w-full text-center">
            <div className="text-slate-100 py-4 bg-slate-900 dark:bg-tournament-dark-hero">
              <h1 className="font-bold md:text-2xl uppercase">
                ¡Elige tu avatar favorito!
              </h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mx-10 my-6">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => handleSelect(avatar)}
                  className={`cursor-pointer rounded border-4 transition-all ${
                    selectedAvatar === avatar.name
                      ? "border-purple-600 shadow-lg shadow-purple-600/40 scale-105"
                      : "border-transparent hover:border-purple-500"
                  }`}
                >
                  <Image
                    src={`/profile/${avatar.imageUrl}.webp`}
                    alt={avatar.name}
                    width={200}
                    height={200}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
