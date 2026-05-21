"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  IoCloseOutline,
  IoLayersOutline,
  IoListOutline,
  IoLockClosedOutline,
  IoPersonCircleOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { TbPhotoEdit } from "react-icons/tb";
import { FiAward, FiTarget, FiTrendingUp } from "react-icons/fi";
import { ButtonLogOut } from "../login/ButtonLogOut";
import { Modal } from "../ui/modal/modal";
import { getProfileTournament, updateUser } from "@/actions";
import { useToastStore, useUIStore } from "@/store";
import {
  type ActiveTournamentData,
  type TournamentSnapshot,
} from "@/interfaces";
import { ProfileSectionsTabs, type ProfileTab } from "./ProfileSectionsTabs";
import { ProfileTournamentSection } from "./ProfileTournamentSection";
import { ProfileTournamentHistorySection } from "./ProfileTournamentHistorySection";
import { ProfileDecksSection } from "./ProfileDecksSection";
import { ProfileCurrentTournament } from "./ProfileCurrentTournament";
import { ProfileChangePasswordModal } from "./ProfileChangePasswordModal";
import { ProfileAvatarFrame } from "./ProfileAvatarFrame";
import { getAvatarUrl, getAvatarValue } from "@/utils/avatar-image";
import {
  DEFAULT_PROFILE_BANNER,
  getProfileBannerUrl,
  getProfileBannerValue,
} from "@/utils/profile-banner";
import {
  getProfileFrameUrl,
  getProfileFrameValue,
} from "@/utils/profile-frame";
import { updateUserBanner, updateUserFrame } from "@/actions";

interface User {
  name?: string | null;
  lastname?: string | null;
  email?: string | null;
  nickname?: string | null;
  image?: string | null;
  bannerImage?: string | null;
  frameImage?: string | null;
  role?: string | null;
  victoryPoints?: number | null;
  eloPoints?: number | null;
  matchesPlayed?: number | null;
  tournamentsPlayed?: number | null;
}

// interface Archetype {
//   name: string| null;
// }

type Avatar = {
  id: string;
  name: string;
  imageUrl: string;
};

type DeckCounts = {
  totalDecks: number;
  publicDecks: number;
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

interface Props {
  user: User;
  avatars: Avatar[];
  banners: Avatar[];
  frames: Avatar[];
  activeTournament: ActiveTournamentData | null;
  tournaments: TournamentHistoryItem[];
  deckCounts: DeckCounts;
}

export const Pefil = ({
  user,
  avatars,
  banners,
  frames,
  activeTournament,
  tournaments,
  deckCounts,
}: Props) => {
  const [showProfileCosmetics, setShowProfileCosmetics] = useState(false);
  const [activeCosmeticTab, setActiveCosmeticTab] = useState<
    "AVATAR" | "BANNER" | "FRAME"
  >("AVATAR");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [baseAvatar, setBaseAvatar] = useState(getAvatarValue(user.image));
  const [selectedAvatar, setSelectedAvatar] = useState(baseAvatar);
  const [baseBanner, setBaseBanner] = useState(
    getProfileBannerValue(user.bannerImage ?? DEFAULT_PROFILE_BANNER),
  );
  const [selectedBanner, setSelectedBanner] = useState(baseBanner);
  const [baseFrame, setBaseFrame] = useState(
    getProfileFrameValue(user.frameImage),
  );
  const [selectedFrame, setSelectedFrame] = useState(baseFrame);

  useEffect(() => {
    const nextAvatar = getAvatarValue(user.image);
    setBaseAvatar(nextAvatar);
    setSelectedAvatar(nextAvatar);
  }, [user.image]);

  useEffect(() => {
    const nextBanner = getProfileBannerValue(
      user.bannerImage ?? DEFAULT_PROFILE_BANNER,
    );
    setBaseBanner(nextBanner);
    setSelectedBanner(nextBanner);
  }, [user.bannerImage]);

  useEffect(() => {
    const nextFrame = getProfileFrameValue(user.frameImage);
    setBaseFrame(nextFrame);
    setSelectedFrame(nextFrame);
  }, [user.frameImage]);
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const { data: session, update } = useSession();
  const hasSession = Boolean(session?.user?.idd ?? user.email);
  const passwordButtonClass =
    "inline-flex items-center gap-2 rounded-full border border-purple-300/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-purple-700 shadow-sm transition hover:bg-purple-50 dark:border-purple-500/60 dark:bg-tournament-dark-surface/80 dark:text-purple-100 dark:hover:bg-tournament-dark-muted";

  const closeProfileCosmetics = () => {
    setSelectedAvatar(baseAvatar);
    setSelectedBanner(baseBanner);
    setSelectedFrame(baseFrame);
    setShowProfileCosmetics(false);
  };

  const handleSelectAvatar = (avatar: Avatar) => {
    setSelectedAvatar(getAvatarValue(avatar.imageUrl));
  };

  const handleSelectBanner = (banner: Avatar) => {
    setSelectedBanner(getProfileBannerValue(banner.imageUrl));
  };

  const handleSelectFrame = (frame: Avatar | null) => {
    setSelectedFrame(frame ? getProfileFrameValue(frame.imageUrl) : "");
  };

  const hasCosmeticChanges =
    selectedAvatar !== baseAvatar ||
    selectedBanner !== baseBanner ||
    selectedFrame !== baseFrame;

  const handleSaveProfileCosmetics = async () => {
    if (!hasCosmeticChanges) {
      showToast("No hay cambios por guardar", "info");
      return;
    }

    showLoading("Guardando personalizacion...");

    try {
      const avatarChanged = selectedAvatar !== baseAvatar;
      const bannerChanged = selectedBanner !== baseBanner;
      const frameChanged = selectedFrame !== baseFrame;

      if (avatarChanged) {
        await updateUser(selectedAvatar);
      }

      if (bannerChanged) {
        await updateUserBanner(selectedBanner);
      }

      if (frameChanged) {
        await updateUserFrame(selectedFrame || null);
      }

      if (avatarChanged) {
        // Sincroniza el avatar en la sesion para reflejarlo en el top menu.
        await update({ user: { image: selectedAvatar } });
      }

      setBaseAvatar(selectedAvatar);
      setBaseBanner(selectedBanner);
      setBaseFrame(selectedFrame);
      setShowProfileCosmetics(false);
      showToast("Perfil personalizado correctamente", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la personalizacion",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const openProfileCosmetics = (tab: "AVATAR" | "BANNER" | "FRAME") => {
    setSelectedAvatar(baseAvatar);
    setSelectedBanner(baseBanner);
    setSelectedFrame(baseFrame);
    setActiveCosmeticTab(tab);
    setShowProfileCosmetics(true);
  };

  const isPlayer = user.role === "player";
  const avatarItems = useMemo(() => avatars, [avatars]);

  const bannerItems = useMemo(() => banners, [banners]);
  const frameItems = useMemo(() => frames, [frames]);

  const matchesPlayed = user.matchesPlayed ?? 0;
  const eloPoints = user.eloPoints ?? 0;
  // Mantiene la misma formula de winrate usada en el ranking de /torneos.
  const winrateRaw = matchesPlayed > 0 ? (eloPoints / matchesPlayed) * 100 : 0;
  const winrate = Math.min(100, Math.max(0, Math.round(winrateRaw)));
  const tournamentsPlayed = user.tournamentsPlayed ?? 0;
  const deckCountToShow = hasSession
    ? deckCounts.totalDecks
    : deckCounts.publicDecks;
  const hasTournamentTab =
    isPlayer &&
    Boolean(
      activeTournament?.currentTournament || activeTournament?.lastTournament,
    );
  const tournamentTabLabel = activeTournament?.currentTournament
    ? "Torneo actual"
    : "Último torneo";
  const showHistoryTab = isPlayer;
  const [selectedTournament, setSelectedTournament] =
    useState<TournamentSnapshot | null>(null);
  const availableTabs = useMemo(() => {
    const tabs: ProfileTab[] = [];
    if (hasTournamentTab) tabs.push("tournament");
    if (showHistoryTab) tabs.push("history");
    tabs.push("decks");
    if (selectedTournament) tabs.push("selected");
    return tabs;
  }, [hasTournamentTab, showHistoryTab, selectedTournament]);
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    availableTabs[0] ?? "decks",
  );

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] ?? "decks");
    }
  }, [activeTab, availableTabs]);

  const handleTabShortcut = (tab: ProfileTab) => {
    // Asegura que el contenido del tab quede visible al cambiar desde el banner.
    setActiveTab(tab);
    const target = document.getElementById("perfil-tabs");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const profileTournamentData: ActiveTournamentData = useMemo(
    () => ({
      currentUserId: session?.user?.idd ?? "",
      inProgressCount: 0,
      currentTournament: null,
      lastTournament: null,
    }),
    [session?.user?.idd],
  );

  const handleOpenTournamentFromHistory = async (tournamentId: string) => {
    // Obtiene el snapshot del torneo para mostrarlo en el tab dedicado.
    showLoading("Cargando torneo...");
    try {
      const snapshot = await getProfileTournament({ tournamentId });
      setSelectedTournament(snapshot);
      setActiveTab("selected");
      const target = document.getElementById("perfil-tabs");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "No se pudo cargar el torneo",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-8 px-4 pb-10 pt-6">
        <section className="relative min-h-[320px] overflow-visible rounded-2xl border border-slate-200 bg-white/80 shadow-xl sm:min-h-[360px] lg:min-h-[400px] dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <Image
              src={getProfileBannerUrl(selectedBanner)}
              alt="Banner de perfil"
              title="Banner de perfil"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-50/95 via-slate-50/60 to-transparent dark:from-tournament-dark-bg/95 dark:via-tournament-dark-bg/60" />
          </div>
          <button
            type="button"
            onClick={() => openProfileCosmetics("AVATAR")}
            aria-label="Cambiar banner"
            className="absolute inset-0 z-[1] cursor-pointer"
          />
          <button
            type="button"
            onClick={() => openProfileCosmetics("AVATAR")}
            title="Personalizar avatar, banner y marco"
            // Se fuerza un z-index superior al contenido del header para asegurar el click del gatillo del modal.
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-purple-500/60 bg-purple-600/80 text-white shadow-lg shadow-purple-700/30 transition hover:bg-purple-500 sm:bottom-4 sm:right-4 sm:top-auto"
          >
            <TbPhotoEdit className="h-5 w-5" />
          </button>

          <div className="relative z-10 flex min-h-[320px] flex-row items-end justify-between gap-6 px-6 pb-6 pt-24 sm:min-h-[360px] sm:px-10 sm:pt-28 lg:min-h-[400px] lg:px-14 lg:pt-32">
            <div className="flex flex-row items-end gap-7 sm:gap-8">
              <ProfileAvatarFrame
                avatarSrc={getAvatarUrl(selectedAvatar || user.image)}
                avatarAlt={
                  user.nickname
                    ? `Avatar de ${user.nickname}`
                    : "Avatar de usuario"
                }
                avatarTitle={
                  user.nickname
                    ? `Avatar de ${user.nickname}`
                    : "Avatar de usuario"
                }
                frameSrc={
                  selectedFrame ? getProfileFrameUrl(selectedFrame) : undefined
                }
              />
              <div className="space-y-2 text-left">
                <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl dark:text-white">
                  {user.nickname}
                </h1>
                <p className="text-sm text-slate-600 sm:text-base dark:text-purple-200">
                  {[user.name, user.lastname].filter(Boolean).join(" ")}
                </p>
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  <button
                    type="button"
                    onClick={() => handleTabShortcut("history")}
                    title="Ver torneos jugados"
                    className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-100/70 px-3 py-1 text-amber-700 transition hover:bg-amber-200/70 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-100 dark:hover:bg-amber-500/25"
                  >
                    <IoTrophyOutline className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                    <span className="text-xs font-semibold">
                      {tournamentsPlayed}
                    </span>
                    <span className="sr-only">Torneos jugados</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabShortcut("decks")}
                    title="Ver mazos"
                    className="inline-flex items-center gap-2 rounded-full border border-purple-300/60 bg-purple-100/70 px-3 py-1 text-purple-700 transition hover:bg-purple-200/70 dark:border-purple-400/40 dark:bg-purple-500/15 dark:text-purple-100 dark:hover:bg-purple-500/25"
                  >
                    <IoLayersOutline className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                    <span className="text-xs font-semibold">
                      {deckCountToShow}
                    </span>
                    <span className="sr-only">Mazos</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/80">
            <div className="absolute left-1/2 top-0 h-1 w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-400/90 to-transparent" />
            <div className="flex items-center gap-2">
              <FiTrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-purple-300">
                Win rate
              </p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-amber-600 dark:text-amber-200">
              {winrate}%
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Basado en {matchesPlayed} partidas
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/80">
            <div className="absolute left-1/2 top-0 h-1 w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-fuchsia-500/90 to-transparent" />
            <div className="flex items-center gap-2">
              <FiAward className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-300" />
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-purple-300">
                Puntos de victoria
              </p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-fuchsia-600 dark:text-fuchsia-200">
              {user.victoryPoints ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Acumulados
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/80">
            <div className="absolute left-1/2 top-0 h-1 w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-400/90 to-transparent" />
            <div className="flex items-center gap-2">
              <FiTarget className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-purple-300">
                Elo
              </p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-indigo-600 dark:text-indigo-200">
              {user.eloPoints ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Ranking actual
            </p>
          </div>
        </section>

        <ProfileSectionsTabs
          active={activeTab}
          onChange={setActiveTab}
          rightSlot={
            hasSession ? (
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(true)}
                title="Cambiar contraseña"
                className={passwordButtonClass}
              >
                <IoLockClosedOutline className="h-4 w-4" />
                <span className="text-xs font-semibold">
                  Cambiar contraseña
                </span>
              </button>
            ) : null
          }
          tabs={[
            {
              id: "tournament",
              label: tournamentTabLabel,
              icon: <IoTrophyOutline className="h-4 w-4" />,
              content: (
                <ProfileTournamentSection
                  activeTournament={activeTournament}
                  hasSession={hasSession}
                  isPlayer={isPlayer}
                />
              ),
              hidden: !hasTournamentTab,
            },
            {
              id: "history",
              label: "Torneos jugados",
              icon: <IoListOutline className="h-4 w-4" />,
              content: (
                <ProfileTournamentHistorySection
                  tournaments={tournaments}
                  onSelectTournament={handleOpenTournamentFromHistory}
                />
              ),
              hidden: !showHistoryTab,
            },
            {
              id: "decks",
              label: "Mazos",
              icon: <IoLayersOutline className="h-4 w-4" />,
              content: <ProfileDecksSection hasSession={hasSession} />,
            },
            {
              id: "selected",
              label: "Torneo",
              icon: <IoTrophyOutline className="h-4 w-4" />,
              content: selectedTournament ? (
                <section className="w-full space-y-4">
                  <h2 className="text-2xl font-semibold text-slate-800 dark:text-purple-200">
                    Torneo seleccionado
                  </h2>
                  <ProfileCurrentTournament
                    data={activeTournament ?? profileTournamentData}
                    selectedTournament={selectedTournament}
                    enableDeckAssociation={isPlayer}
                    hasSession={hasSession}
                  />
                </section>
              ) : null,
              hidden: !selectedTournament,
            },
          ]}
        />

        <div className="flex flex-wrap justify-center gap-4">
          <ButtonLogOut className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold shadow-md hover:shadow-red-500/50 transition text-white">
            Cerrar sesion
          </ButtonLogOut>
        </div>
      </div>

      {showProfileCosmetics && (
        <Modal
          className="inset-0 flex items-center justify-center p-4"
          close={closeProfileCosmetics}
          hideCloseButton
        >
          <div className="flex w-full max-w-6xl max-h-[90vh] flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-center shadow-xl dark:border-tournament-dark-border dark:bg-tournament-dark-bg">
            <div className="relative flex items-center justify-center bg-slate-50 px-4 py-4 text-slate-900 dark:bg-tournament-dark-bg dark:text-slate-100">
              <h1 className="text-center font-bold uppercase md:text-2xl">
                Personaliza tu perfil
              </h1>
              <button
                type="button"
                onClick={closeProfileCosmetics}
                className="absolute right-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:border-purple-400 hover:text-purple-700 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Cerrar"
                title="Cerrar"
              >
                <IoCloseOutline className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-tournament-dark-border dark:bg-tournament-dark-bg">
              <button
                type="button"
                onClick={() => setActiveCosmeticTab("AVATAR")}
                className={`rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  activeCosmeticTab === "AVATAR"
                    ? "border-purple-500 bg-purple-100 text-purple-700 dark:bg-purple-600/20 dark:text-purple-200"
                    : "border-tournament-dark-accent bg-white text-slate-600 hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200"
                }`}
                title="Editar avatar"
              >
                Avatar
              </button>
              <button
                type="button"
                onClick={() => setActiveCosmeticTab("BANNER")}
                className={`rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  activeCosmeticTab === "BANNER"
                    ? "border-purple-500 bg-purple-100 text-purple-700 dark:bg-purple-600/20 dark:text-purple-200"
                    : "border-tournament-dark-accent bg-white text-slate-600 hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200"
                }`}
                title="Editar banner"
              >
                Banner
              </button>
              <button
                type="button"
                onClick={() => setActiveCosmeticTab("FRAME")}
                className={`rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  activeCosmeticTab === "FRAME"
                    ? "border-purple-500 bg-purple-100 text-purple-700 dark:bg-purple-600/20 dark:text-purple-200"
                    : "border-tournament-dark-accent bg-white text-slate-600 hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200"
                }`}
                title="Editar marco"
              >
                Marco
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-6 md:px-8">
                {activeCosmeticTab === "AVATAR" && (
                  <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {avatarItems.map((avatar) => (
                      <div
                        key={avatar.id}
                        onClick={() => handleSelectAvatar(avatar)}
                        className={`w-fit cursor-pointer rounded border-4 transition-all ${
                          selectedAvatar === getAvatarValue(avatar.imageUrl)
                            ? "scale-105 border-purple-600 shadow-lg shadow-purple-600/40"
                            : "border-transparent hover:border-purple-500"
                        }`}
                      >
                        <Image
                          src={getAvatarUrl(avatar.imageUrl)}
                          alt={avatar.name}
                          title={`Seleccionar avatar ${avatar.name}`}
                          width={200}
                          height={200}
                          className="block object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeCosmeticTab === "BANNER" && (
                  <div className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-3">
                    {bannerItems.map((banner) => (
                      <div
                        key={banner.id}
                        onClick={() => handleSelectBanner(banner)}
                        className={`w-full max-w-[440px] cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                          selectedBanner ===
                          getProfileBannerValue(banner.imageUrl)
                            ? "scale-[1.01] border-purple-600 shadow-lg shadow-purple-600/40"
                            : "border-transparent hover:border-purple-500"
                        }`}
                      >
                        <Image
                          src={getProfileBannerUrl(banner.imageUrl)}
                          alt="Banner de perfil"
                          title="Seleccionar banner de perfil"
                          width={1200}
                          height={500}
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeCosmeticTab === "FRAME" && (
                  <div className="grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    <button
                      type="button"
                      onClick={() => handleSelectFrame(null)}
                      className={`relative box-border flex h-[220px] w-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 bg-slate-200/70 transition-all dark:bg-tournament-dark-muted ${
                        !selectedFrame
                          ? "border-purple-500 shadow-lg shadow-purple-600/40 "
                          : "border-transparent hover:border-purple-500"
                      }`}
                      title="Quitar marco"
                    >
                      <IoPersonCircleOutline className="h-20 w-20 text-slate-500 dark:text-slate-300" />
                      <span className="absolute bottom-2 rounded-full bg-black/60 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                        Sin marco
                      </span>
                    </button>

                    {frameItems.map((frame) => (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => handleSelectFrame(frame)}
                        className={`relative box-border h-[220px] w-[220px] cursor-pointer overflow-hidden rounded-lg border-2 bg-slate-200/70 p-3 transition-all dark:bg-tournament-dark-muted ${
                          selectedFrame === getProfileFrameValue(frame.imageUrl)
                            ? "border-purple-500 shadow-lg shadow-purple-600/40"
                            : "border-transparent hover:border-purple-500"
                        }`}
                        title={`Seleccionar marco ${frame.name}`}
                      >
                        <Image
                          src={getProfileFrameUrl(frame.imageUrl)}
                          alt={frame.name}
                          width={200}
                          height={200}
                          unoptimized
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-start gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 dark:border-tournament-dark-border dark:bg-tournament-dark-bg md:px-8">
              <button
                type="button"
                onClick={closeProfileCosmetics}
                className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:border-purple-400 hover:text-purple-700 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:border-purple-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveProfileCosmetics}
                disabled={!hasCosmeticChanges}
                className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-purple-900/40 disabled:text-slate-400"
              >
                Guardar
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ProfileChangePasswordModal
        open={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
};
