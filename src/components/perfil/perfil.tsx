"use client";

import Image from "next/image";
import { useState } from "react";
import { IoImageOutline } from "react-icons/io5";
import { ButtonLogOut } from "../login/ButtonLogOut";
import { Modal } from "../ui/modal/modal";
import { getActiveTournament, getProfileTournament, updateUser } from "@/actions";
import { useToastStore, useUIStore } from "@/store";
import {
  type ActiveTournamentData,
  type TournamentSnapshot,
} from "@/interfaces";
import { ProfileCurrentTournament } from "./ProfileCurrentTournament";
import { ProfileTournamentHistory } from "./ProfileTournamentHistory";

interface User {
  name?: string | null;
  lastname?: string | null;
  email?: string | null;
  nickname?: string | null;
  image?: string | null;
  role?: string | null;
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
  const [activeTournamentState, setActiveTournamentState] =
    useState<ActiveTournamentData | null>(activeTournament);
  const hasCurrentTournament = Boolean(
    activeTournamentState?.currentTournament
  );
  const [activeTab, setActiveTab] = useState<TabKey>(
    activeTournament ? "current" : "history"
  );
  const [selectedTournament, setSelectedTournament] =
    useState<TournamentSnapshot | null>(null);
  const [hasShownInProgressWarning, setHasShownInProgressWarning] =
    useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    user.image ? user.image : ""
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);

  const handleSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar.imageUrl);
    setShowAvatars(false);
    user.image = avatar.imageUrl;
  };

  const updateUserProfile = async () => {
    try {
      await updateUser(selectedAvatar);
      showToast("Avatar actualizado correctamente", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el avatar",
        "error"
      );
    }
  };

  const hasBaseTournament =
    Boolean(activeTournamentState?.currentTournament) ||
    Boolean(activeTournamentState?.lastTournament);
  const hasSelectedTournament = Boolean(selectedTournament);

  const tabs: TabKey[] = hasBaseTournament
    ? ["current", "history"]
    : ["history"];

  if (hasSelectedTournament) {
    tabs.push("selected");
  }
  // "mazos" queda oculto temporalmente para activarlo en futuro.

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

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
        error instanceof Error
          ? error.message
          : "No se pudo cargar el torneo",
        "error"
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
          "error"
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
        "error"
      );
    } finally {
      hideLoading();
    }
  };

  const currentTabLabel = hasCurrentTournament
    ? "Torneo actual"
    : "Ultimo torneo";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white overflow-hidden p-4">
      {/* Fondo */}
      <div className="absolute inset-0 bg-[url('/images/fondo-souls.jpg')] bg-cover bg-center opacity-20 blur-sm"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/95"></div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-6xl bg-gray-900/70 border border-purple-600/40 rounded-2xl shadow-[rgba(168,85,247,0.3)] p-8 backdrop-blur-md flex flex-col items-center transition">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row items-center gap-8 w-full">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-purple-500 shadow-[rgba(168,85,247,0.4)] transition group-hover:scale-105">
              <Image
                className="rounded-lg"
                width={270}
                height={287}
                src={`/profile/${user.image}.webp`}
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
            <h1 className="text-3xl font-bold text-purple-400">
              {user.nickname}
            </h1>
            {/* <p className="text-gray-300 italic">“No soy un mazo... soy un monstruo.”</p> */}

            {/* Barra de experiencia */}
            {/* <div className="mt-4">
              <p className="text-sm text-gray-400 mb-1">Nivel 12</p>
              <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden border border-purple-700/50">
                <div className="bg-purple-500 h-full w-3/4 transition-all"></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">XP: 750 / 1000</p>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm text-gray-300">
              <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
                <p className="text-gray-400 text-xs">Nombre</p>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
                <p className="text-gray-400 text-xs">Apellido</p>
                <p className="font-semibold">{user.lastname}</p>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
                <p className="text-gray-400 text-xs">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              {user.role && user.role !== "player" && (
                <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
                  <p className="text-gray-400 text-xs">Rol</p>
                  <p className="font-semibold">{user.role}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-10 border-b border-purple-500/40 w-full justify-center md:justify-start">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "text-purple-400 border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-purple-300"
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

        {/* Contenido */}
        <div className="mt-8 w-full">
          {activeTab === "current" && activeTournamentState && (
            <ProfileCurrentTournament
              data={activeTournamentState}
              hasShownInProgressWarning={hasShownInProgressWarning}
              onInProgressWarningShown={() =>
                setHasShownInProgressWarning(true)
              }
              onRefreshTournament={handleRefreshTournament}
            />
          )}

          {activeTab === "selected" &&
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
              />
            )}

          {activeTab === "history" && (
            <ProfileTournamentHistory
              tournaments={tournaments}
              onSelectTournament={handleHistorySelect}
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
          <button
            onClick={() => updateUserProfile()}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold shadow-md hover:shadow-purple-500/50 transition"
          >
            Guardar
          </button>
          <ButtonLogOut className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold shadow-md hover:shadow-red-500/50 transition">
            Cerrar Sesión
          </ButtonLogOut>
        </div>
      </div>
      {showAvatars && (
        <Modal
          className="top-0 left-0 flex justify-center bg-gray-100 z-20 transition-all w-full h-screen md:h-auto md:w-1/2 md:left-1/4 md:top-28"
          close={() => setShowAvatars(false)}
        >
          <div className="overflow-auto w-full text-center">
            <div className=" text-gray-100 py-4 bg-slate-950">
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
                      ? "border-purple-500 shadow-lg shadow-purple-500/50 scale-105"
                      : "border-transparent hover:border-purple-400"
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
