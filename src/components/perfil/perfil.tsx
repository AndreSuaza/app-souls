"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  IoImagesOutline,
  IoLayersOutline,
  IoListOutline,
  IoPersonCircleOutline,
  IoStorefrontOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { TbPhotoEdit } from "react-icons/tb";
import { FiAward, FiTarget, FiTrendingUp } from "react-icons/fi";
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
import { ProfileChangePasswordForm } from "./ProfileChangePasswordForm";
import { ProfileCosmeticShelf } from "./ProfileCosmeticShelf";
import { ProfileAvatarFrame } from "./ProfileAvatarFrame";
import {
  ProfileDashboardSidebar,
  type ProfileDashboardSection,
} from "./ProfileDashboardSidebar";
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

const sectionTitles: Record<ProfileDashboardSection, string> = {
  general: "Vista general",
  avatar: "Avatar",
  banner: "Fondo del perfil",
  store: "Tienda",
  decks: "Mazos",
  tournaments: "Torneos",
  security: "Seguridad",
};
const sectionDescriptions: Record<ProfileDashboardSection, string> = {
  general: "Resumen público y estadísticas principales del jugador.",
  avatar: "Gestiona el avatar y el marco visible en tu perfil.",
  banner: "Selecciona el fondo principal que acompana tu perfil.",
  store: "Consulta tu saldo y accede a cosmeticos canjeables.",
  decks: "Administra tus mazos guardados y competitivos.",
  tournaments: "Revisa torneos actuales, recientes e historial competitivo.",
  security: "Actualiza credenciales y opciones de acceso.",
};

export const Pefil = ({
  user,
  avatars,
  banners,
  frames,
  activeTournament,
  tournaments,
  deckCounts,
}: Props) => {
  const [activeSection, setActiveSection] =
    useState<ProfileDashboardSection>("general");
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

  const handleSelectAvatar = (avatar: Avatar) => {
    setSelectedAvatar(getAvatarValue(avatar.imageUrl));
  };

  const handleSelectBanner = (banner: Avatar) => {
    setSelectedBanner(getProfileBannerValue(banner.imageUrl));
  };

  const handleSelectFrame = (frame: Avatar | null) => {
    setSelectedFrame(frame ? getProfileFrameValue(frame.imageUrl) : "");
  };

  const hasAvatarChanges =
    selectedAvatar !== baseAvatar || selectedFrame !== baseFrame;
  const hasBannerChanges = selectedBanner !== baseBanner;

  const cancelAvatarChanges = () => {
    setSelectedAvatar(baseAvatar);
    setSelectedFrame(baseFrame);
  };

  const cancelBannerChanges = () => {
    setSelectedBanner(baseBanner);
  };

  const handleSaveAvatarCosmetics = async () => {
    if (!hasAvatarChanges) {
      showToast("No hay cambios por guardar", "info");
      return;
    }

    showLoading("Guardando avatar...");

    try {
      const avatarChanged = selectedAvatar !== baseAvatar;
      const frameChanged = selectedFrame !== baseFrame;

      if (avatarChanged) {
        await updateUser(selectedAvatar);
      }

      if (frameChanged) {
        await updateUserFrame(selectedFrame || null);
      }

      if (avatarChanged) {
        // Sincroniza el avatar en la sesion para reflejarlo en el top menu.
        await update({ user: { image: selectedAvatar } });
      }

      setBaseAvatar(selectedAvatar);
      setBaseFrame(selectedFrame);
      showToast("Avatar actualizado correctamente", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "No se pudo guardar el avatar",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const handleSaveBanner = async () => {
    if (!hasBannerChanges) {
      showToast("No hay cambios por guardar", "info");
      return;
    }

    showLoading("Guardando fondo...");

    try {
      await updateUserBanner(selectedBanner);
      setBaseBanner(selectedBanner);
      showToast("Fondo actualizado correctamente", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "No se pudo guardar el fondo",
        "error",
      );
    } finally {
      hideLoading();
    }
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
  const fullName = [user.name, user.lastname].filter(Boolean).join(" ");
  const hasTournamentTab =
    isPlayer &&
    Boolean(
      activeTournament?.currentTournament || activeTournament?.lastTournament,
    );
  const tournamentTabLabel = activeTournament?.currentTournament
    ? "Torneo actual"
    : "Ãšltimo torneo";
  const showHistoryTab = isPlayer;
  const [selectedTournament, setSelectedTournament] =
    useState<TournamentSnapshot | null>(null);
  const availableTabs = useMemo(() => {
    const tabs: ProfileTab[] = [];
    if (hasTournamentTab) tabs.push("tournament");
    if (showHistoryTab) tabs.push("history");
    if (selectedTournament) tabs.push("selected");
    return tabs;
  }, [hasTournamentTab, showHistoryTab, selectedTournament]);
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    availableTabs[0] ?? "history",
  );

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] ?? "history");
    }
  }, [activeTab, availableTabs]);

  const scrollToContent = () => {
    const target = document.getElementById("perfil-content");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSectionChange = (section: ProfileDashboardSection) => {
    setActiveSection(section);
    window.setTimeout(scrollToContent, 0);
  };

  const handleTabShortcut = (tab: ProfileTab) => {
    // Asegura que el contenido del tab quede visible al cambiar desde el banner.
    setActiveSection(tab === "decks" ? "decks" : "tournaments");
    setActiveTab(tab);
    window.setTimeout(scrollToContent, 0);
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
      setActiveSection("tournaments");
      setActiveTab("selected");
      window.setTimeout(scrollToContent, 0);
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
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-4 pb-10 pt-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:px-6">
        <ProfileDashboardSidebar
          activeSection={activeSection}
          onChange={handleSectionChange}
          nickname={user.nickname}
          fullName={fullName}
        />

        <main id="perfil-content" className="min-w-0 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-300">
              Perfil
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {sectionTitles[activeSection]}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {sectionDescriptions[activeSection]}
            </p>
          </div>

          {activeSection === "general" && (
            <div className="space-y-8">
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
                  onClick={() => handleSectionChange("banner")}
                  aria-label="Cambiar fondo del perfil"
                  className="absolute inset-0 z-[1] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleSectionChange("avatar")}
                  title="Personalizar avatar y marco"
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
                        selectedFrame
                          ? getProfileFrameUrl(selectedFrame)
                          : undefined
                      }
                    />
                    <div className="space-y-2 text-left">
                      <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl dark:text-white">
                        {user.nickname}
                      </h1>
                      <p className="text-sm text-slate-600 sm:text-base dark:text-purple-200">
                        {fullName}
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
            </div>
          )}

          {activeSection === "avatar" && (
            <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70 sm:p-6">
              <div className="grid gap-5 rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 dark:border-purple-500/30 dark:from-purple-950/30 dark:to-tournament-dark-bg lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
                <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/80 p-5 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/60">
                  <ProfileAvatarFrame
                    avatarSrc={getAvatarUrl(selectedAvatar || user.image)}
                    avatarAlt="Avatar actual"
                    avatarTitle="Avatar actual"
                    frameSrc={
                      selectedFrame
                        ? getProfileFrameUrl(selectedFrame)
                        : undefined
                    }
                  />
                  <p className="mt-5 text-sm font-semibold text-slate-800 dark:text-white">
                    Avatar actual
                  </p>
                  <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
                    Vista previa del avatar y marco seleccionado.
                  </p>
                </div>

                <div className="flex flex-col justify-center">
                  <IoPersonCircleOutline className="h-10 w-10 text-purple-600 dark:text-purple-300" />
                  <h3 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                    Avatar y marco
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                    Selecciona la imagen principal del perfil y el marco que la
                    rodea.
                  </p>
                </div>
              </div>

              <ProfileCosmeticShelf
                title="Tus avatares"
                description="La primera fila queda visible para cambiar rapido de avatar."
                compactHeight={228}
              >
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {avatarItems.map((avatar) => {
                    const avatarValue = getAvatarValue(avatar.imageUrl);
                    const isSelected = selectedAvatar === avatarValue;

                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => handleSelectAvatar(avatar)}
                        title={`Seleccionar avatar ${avatar.name}`}
                        className={`box-border flex h-[218px] min-w-0 flex-col rounded-2xl border-2 p-3 text-left transition ${
                          isSelected
                            ? "border-purple-500 bg-purple-100 shadow-[0_0_24px_rgba(147,51,234,0.28)] dark:bg-purple-500/15"
                            : "border-transparent bg-white hover:border-purple-400 dark:bg-tournament-dark-surface dark:hover:border-purple-500"
                        }`}
                      >
                        <Image
                          src={getAvatarUrl(avatar.imageUrl)}
                          alt={avatar.name}
                          width={220}
                          height={220}
                          className="h-40 w-full rounded-xl object-cover"
                        />
                        <span className="mt-3 truncate text-sm font-semibold text-slate-800 dark:text-white">
                          {avatar.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ProfileCosmeticShelf>

              <ProfileCosmeticShelf
                title="Tus marcos"
                description="Selecciona un marco o conserva el avatar sin marco."
                compactHeight={228}
              >
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  <button
                    type="button"
                    onClick={() => handleSelectFrame(null)}
                    title="Quitar marco"
                    className={`box-border flex h-[212px] min-w-0 flex-col items-center justify-between rounded-2xl border-2 p-3 transition ${
                      !selectedFrame
                        ? "border-purple-500 bg-purple-100 shadow-[0_0_24px_rgba(147,51,234,0.28)] dark:bg-purple-500/15"
                        : "border-transparent bg-white hover:border-purple-400 dark:bg-tournament-dark-surface dark:hover:border-purple-500"
                    }`}
                  >
                    <span className="flex h-40 w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-tournament-dark-muted">
                      <IoPersonCircleOutline className="h-24 w-24 text-slate-500 dark:text-slate-300" />
                    </span>
                    <span className="mt-3 truncate text-sm font-semibold text-slate-800 dark:text-white">
                      Sin marco
                    </span>
                  </button>

                  {frameItems.map((frame) => {
                    const frameValue = getProfileFrameValue(frame.imageUrl);
                    const isSelected = selectedFrame === frameValue;

                    return (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => handleSelectFrame(frame)}
                        title={`Seleccionar marco ${frame.name}`}
                        className={`box-border flex h-[212px] min-w-0 flex-col rounded-2xl border-2 p-3 text-left transition ${
                          isSelected
                            ? "border-purple-500 bg-purple-100 shadow-[0_0_24px_rgba(147,51,234,0.28)] dark:bg-purple-500/15"
                            : "border-transparent bg-white hover:border-purple-400 dark:bg-tournament-dark-surface dark:hover:border-purple-500"
                        }`}
                      >
                        <span className="flex h-40 w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-tournament-dark-muted">
                          <Image
                            src={getProfileFrameUrl(frame.imageUrl)}
                            alt={frame.name}
                            width={220}
                            height={220}
                            unoptimized
                            className="h-full w-full object-contain"
                          />
                        </span>
                        <span className="mt-3 truncate text-sm font-semibold text-slate-800 dark:text-white">
                          {frame.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ProfileCosmeticShelf>

              <div className="flex flex-wrap justify-start gap-3 border-t border-slate-200 pt-5 dark:border-tournament-dark-border">
                <button
                  type="button"
                  onClick={cancelAvatarChanges}
                  disabled={!hasAvatarChanges}
                  className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:border-purple-400 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:border-purple-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatarCosmetics}
                  disabled={!hasAvatarChanges}
                  className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-purple-900/40 disabled:text-slate-400"
                >
                  Guardar
                </button>
              </div>
            </section>
          )}

          {activeSection === "banner" && (
            <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70 sm:p-6">
              <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-slate-200 dark:border-tournament-dark-border">
                <Image
                  src={getProfileBannerUrl(selectedBanner)}
                  alt="Fondo actual del perfil"
                  title="Fondo actual del perfil"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                <div className="relative z-10 flex min-h-[260px] max-w-xl flex-col justify-end p-6 text-white">
                  <IoImagesOutline className="h-10 w-10 text-purple-200" />
                  <h3 className="mt-4 text-2xl font-semibold">
                    Fondo del perfil
                  </h3>
                  <p className="mt-2 text-sm text-purple-100">
                    Controla la imagen principal que acompana el encabezado
                    público del perfil.
                  </p>
                </div>
              </div>

              <ProfileCosmeticShelf
                title="Tus fondos"
                description="Selecciona el banner que aparece en el encabezado del perfil."
                compactHeight={216}
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {bannerItems.map((banner) => {
                    const bannerValue = getProfileBannerValue(banner.imageUrl);
                    const isSelected = selectedBanner === bannerValue;

                    return (
                      <button
                        key={banner.id}
                        type="button"
                        onClick={() => handleSelectBanner(banner)}
                        title={`Seleccionar fondo ${banner.name}`}
                        className={`box-border flex h-[200px] min-w-0 flex-col rounded-2xl border-2 p-3 text-left transition ${
                          isSelected
                            ? "border-purple-500 bg-purple-100 shadow-[0_0_24px_rgba(147,51,234,0.28)] dark:bg-purple-500/15"
                            : "border-transparent bg-white hover:border-purple-400 dark:bg-tournament-dark-surface dark:hover:border-purple-500"
                        }`}
                      >
                        <Image
                          src={getProfileBannerUrl(banner.imageUrl)}
                          alt={banner.name}
                          width={1200}
                          height={500}
                          className="h-36 w-full rounded-xl object-cover"
                        />
                        <span className="mt-3 truncate text-sm font-semibold text-slate-800 dark:text-white">
                          {banner.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ProfileCosmeticShelf>

              <div className="flex flex-wrap justify-start gap-3 border-t border-slate-200 pt-5 dark:border-tournament-dark-border">
                <button
                  type="button"
                  onClick={cancelBannerChanges}
                  disabled={!hasBannerChanges}
                  className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:border-purple-400 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:border-purple-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBanner}
                  disabled={!hasBannerChanges}
                  className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-purple-900/40 disabled:text-slate-400"
                >
                  Guardar
                </button>
              </div>
            </section>
          )}

          {activeSection === "store" && (
            <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-lg dark:border-amber-400/30 dark:bg-amber-500/10">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 dark:text-amber-200">
                  Saldo disponible
                </p>
                <p className="mt-3 text-5xl font-bold text-amber-700 dark:text-amber-100">
                  {user.victoryPoints ?? 0} PV
                </p>
                <p className="mt-3 text-sm text-amber-800/80 dark:text-amber-100/70">
                  Usa tus puntos de victoria para canjear cosmeticos de la
                  tienda.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70">
                <IoStorefrontOutline className="h-10 w-10 text-purple-600 dark:text-purple-300" />
                <h3 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
                  Tienda de cosmeticos
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Explora avatares, banners y marcos disponibles para
                  personalizar tu perfil.
                </p>
                <Link
                  href="/tienda"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500"
                >
                  <IoStorefrontOutline className="h-4 w-4" />
                  Ir a la tienda
                </Link>
              </div>
            </section>
          )}

          {activeSection === "decks" && (
            <ProfileDecksSection hasSession={hasSession} />
          )}

          {activeSection === "tournaments" && (
            <div className="space-y-4">
              <ProfileSectionsTabs
                active={activeTab}
                onChange={setActiveTab}
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
              {!hasTournamentTab && !showHistoryTab && !selectedTournament && (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70 dark:text-slate-300">
                  No hay torneos disponibles para mostrar.
                </div>
              )}
            </div>
          )}

          {activeSection === "security" && (
            <ProfileChangePasswordForm disabled={!hasSession} />
          )}
        </main>
      </div>
    </div>
  );
};
