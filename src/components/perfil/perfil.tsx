"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { useToastStore, useUIStore } from "@/store";
import { useUserDecksStore } from "@/store";
import {
  type ActiveTournamentData,
  type TournamentSnapshot,
} from "@/interfaces";
import { ProfileCurrentTournament } from "./ProfileCurrentTournament";
import { ProfileTournamentHistory } from "./ProfileTournamentHistory";
import { UserDeckLibrary } from "../mazos/deck-library/UserDeckLibrary";
import { getAvatarUrl, getAvatarValue } from "@/utils/avatar-image";
import {
  DEFAULT_PROFILE_BANNER,
  getProfileBannerUrl,
  getProfileBannerValue,
} from "@/utils/profile-banner";
import { updateUserBanner } from "@/actions";

interface User {
  name?: string | null;
  lastname?: string | null;
  email?: string | null;
  nickname?: string | null;
  image?: string | null;
  bannerImage?: string | null;
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

type TabKey = "current" | "history" | "selected" | "mazos";

interface Props {
  user: User;
  avatars: Avatar[];
  banners: Avatar[];
  activeTournament: ActiveTournamentData | null;
  tournaments: TournamentHistoryItem[];
  deckCounts: DeckCounts;
}

export const Pefil = ({
  user,
  avatars,
  banners,
  activeTournament,
  tournaments,
  deckCounts,
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
  const [showBanners, setShowBanners] = useState(false);
  const [baseAvatar, setBaseAvatar] = useState(getAvatarValue(user.image));
  const [selectedAvatar, setSelectedAvatar] = useState(baseAvatar);
  const [baseBanner, setBaseBanner] = useState(
    getProfileBannerValue(user.bannerImage ?? DEFAULT_PROFILE_BANNER),
  );
  const [selectedBanner, setSelectedBanner] = useState(baseBanner);
  const isAvatarChanged = selectedAvatar !== baseAvatar;
  const isBannerChanged = selectedBanner !== baseBanner;

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
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
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
    setSelectedAvatar(getAvatarValue(avatar.imageUrl));
    setShowAvatars(false);
  };

  const handleSelectBanner = (banner: Avatar) => {
    setSelectedBanner(getProfileBannerValue(banner.imageUrl));
    setShowBanners(false);
  };

  const updateUserProfile = async () => {
    try {
      showLoading("Actualizando perfil...");
      if (isAvatarChanged) {
        await updateUser(selectedAvatar);
        // Sincroniza el avatar en la sesion para reflejarlo en el top menu.
        await update({ user: { image: selectedAvatar } });
        setBaseAvatar(selectedAvatar);
      }
      if (isBannerChanged) {
        await updateUserBanner(selectedBanner);
        setBaseBanner(selectedBanner);
      }
      showToast("Perfil actualizado correctamente", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el perfil",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const handleDiscardAvatar = () => {
    setSelectedAvatar(baseAvatar);
    setSelectedBanner(baseBanner);
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

  const avatarItems = useMemo(() => avatars, [avatars]);

  const bannerItems = useMemo(() => banners, [banners]);

  const matchesPlayed = user.matchesPlayed ?? 0;
  const eloPoints = user.eloPoints ?? 0;
  // Mantiene la misma formula de winrate usada en el ranking de /torneos.
  const winrateRaw = matchesPlayed > 0 ? (eloPoints / matchesPlayed) * 100 : 0;
  const winrate = Math.min(100, Math.max(0, Math.round(winrateRaw)));
  const tournamentsPlayed = user.tournamentsPlayed ?? 0;
  const deckCountToShow = hasSession
    ? deckCounts.totalDecks
    : deckCounts.publicDecks;
  const hasProfileChanges = isAvatarChanged || isBannerChanged;

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
    <div className="min-h-screen bg-tournament-dark-bg text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 pt-6">
        <section className="relative overflow-hidden rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface/70 shadow-xl">
          <div className="relative h-56 w-full sm:h-64 lg:h-72">
            <Image
              src={getProfileBannerUrl(selectedBanner)}
              alt="Banner de perfil"
              title="Banner de perfil"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-tournament-dark-bg" />
            <button
              type="button"
              onClick={() => setShowBanners(true)}
              aria-label="Cambiar banner"
              className="absolute inset-0 z-10 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setShowBanners(true)}
              title="Cambiar banner"
              className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/60 bg-purple-600/80 text-white shadow-lg shadow-purple-700/30 transition hover:bg-purple-500"
            >
              <IoImageOutline className="h-5 w-5" />
            </button>
          </div>

          <div className="relative -mt-16 flex flex-col gap-6 px-6 pb-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="relative">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-purple-500 shadow-[0_0_25px_rgba(147,51,234,0.45)] sm:h-32 sm:w-32">
                  <Image
                    src={getAvatarUrl(selectedAvatar || user.image)}
                    alt={
                      user.nickname
                        ? `Avatar de ${user.nickname}`
                        : "Avatar de usuario"
                    }
                    title={
                      user.nickname
                        ? `Avatar de ${user.nickname}`
                        : "Avatar de usuario"
                    }
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatars(true)}
                  title="Cambiar avatar"
                  className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border border-purple-500/60 bg-purple-600/80 text-white shadow-lg shadow-purple-700/30 transition hover:bg-purple-500"
                >
                  <IoImageOutline className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2 text-left">
                <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                  {user.nickname}
                </h1>
                <p className="text-sm text-purple-200 sm:text-base">
                  {[user.name, user.lastname].filter(Boolean).join(" ")}
                </p>
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-slate-300">
                  <span className="rounded-full border border-purple-500/40 bg-purple-600/20 px-3 py-1">
                    {tournamentsPlayed} torneos jugados
                  </span>
                  <span className="rounded-full border border-purple-500/40 bg-purple-600/20 px-3 py-1">
                    {deckCountToShow} mazos
                  </span>
                </div>
              </div>
            </div>

            {hasProfileChanges && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDiscardAvatar}
                  className="rounded-lg border border-slate-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-slate-700"
                >
                  Descartar
                </button>
                <button
                  onClick={updateUserProfile}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md shadow-purple-700/40 transition hover:bg-purple-500"
                >
                  Guardar cambios
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface/80 p-5 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-300">
              Win rate
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{winrate}%</p>
            <p className="mt-1 text-xs text-slate-400">
              Basado en {matchesPlayed} partidas
            </p>
          </div>
          <div className="rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface/80 p-5 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-300">
              Puntos de victoria
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {user.victoryPoints ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-400">Acumulados</p>
          </div>
          <div className="rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface/80 p-5 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-300">
              Elo
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {user.eloPoints ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-400">Ranking actual</p>
          </div>
        </section>

        {tabs.length > 0 && (
          <div className="flex w-full justify-center border-b border-tournament-dark-border md:justify-start">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide transition ${
                  activeTab === tab
                    ? "text-purple-300 border-b-2 border-purple-400"
                    : "text-slate-400 hover:text-purple-200"
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

        <div className="w-full">
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
              disableLikeButton={false}
              headerContent={
                <div className="flex flex-wrap items-center gap-3">
                  {hasSession && hasLoadedDecks ? (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const tooltipText =
                          "La cantidad maxima de mazos permitidos es 12.";
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
                              title="Crear un mazo en el laboratorio"
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
                            "inline-flex items-center rounded-lg border px-5 py-2 text-xs font-semibold uppercase tracking-wide transition",
                            isActive
                              ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                              : "border-transparent bg-white text-slate-500 hover:text-purple-600 dark:bg-tournament-dark-muted dark:text-slate-300",
                          )}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              }
            />
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <ButtonLogOut className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold shadow-md hover:shadow-red-500/50 transition text-white">
            Cerrar sesion
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
                Elige tu avatar favorito!
              </h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mx-10 my-6">
              {avatarItems.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => handleSelect(avatar)}
                  className={`cursor-pointer rounded border-4 transition-all ${
                    selectedAvatar === getAvatarValue(avatar.imageUrl)
                      ? "border-purple-600 shadow-lg shadow-purple-600/40 scale-105"
                      : "border-transparent hover:border-purple-500"
                  }`}
                >
                  <Image
                    src={getAvatarUrl(avatar.imageUrl)}
                    alt={avatar.name}
                    title={`Seleccionar avatar ${avatar.name}`}
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

      {showBanners && (
        <Modal
          className="top-0 left-0 flex justify-center bg-slate-50 dark:bg-tournament-dark-bg z-20 transition-all w-full h-screen md:h-auto md:w-3/4 md:left-[12.5%] md:top-20"
          close={() => setShowBanners(false)}
        >
          <div className="overflow-auto w-full text-center">
            <div className="text-slate-100 py-4 bg-slate-900 dark:bg-tournament-dark-hero">
              <h1 className="font-bold md:text-2xl uppercase">
                Elige tu banner favorito!
              </h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-6 my-6">
              {bannerItems.map((banner) => (
                <div
                  key={banner.id}
                  onClick={() => handleSelectBanner(banner)}
                  className={`cursor-pointer rounded-xl border-2 transition-all overflow-hidden ${
                    selectedBanner === getProfileBannerValue(banner.imageUrl)
                      ? "border-purple-600 shadow-lg shadow-purple-600/40 scale-[1.01]"
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
          </div>
        </Modal>
      )}
    </div>
  );
};
