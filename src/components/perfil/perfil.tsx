"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getProfileTournament,
  type CosmeticStoreData,
  type CosmeticStoreItem,
  updateUser,
} from "@/actions";
import { useToastStore, useUIStore } from "@/store";
import {
  type ActiveTournamentData,
  type TournamentSnapshot,
} from "@/interfaces";
import { type ProfileTab } from "./ProfileSectionsTabs";
import { ProfileDecksSection } from "./ProfileDecksSection";
import {
  ProfileDashboardSidebar,
  type ProfileDashboardSection,
} from "./ProfileDashboardSidebar";
import { getAvatarValue } from "@/utils/avatar-image";
import {
  DEFAULT_PROFILE_BANNER,
  getProfileBannerValue,
} from "@/utils/profile-banner";
import { getProfileFrameValue } from "@/utils/profile-frame";
import { updateUserBanner, updateUserFrame } from "@/actions";
import { ProfileGeneralSection } from "./ProfileGeneralSection";
import { ProfileAvatarSection } from "./ProfileAvatarSection";
import { ProfileBannerSection } from "./ProfileBannerSection";
import { ProfileSectionHeader } from "./ProfileSectionHeader";
import { ProfileStoreSection } from "./ProfileStoreSection";
import { ProfileSecuritySection } from "./ProfileSecuritySection";
import { ProfileTournamentsSection } from "./ProfileTournamentsSection";
import type {
  DeckCounts,
  ProfileCosmeticItem,
  ProfileUser,
  TournamentHistoryItem,
} from "./ProfileSection.types";

// interface Archetype {
//   name: string| null;
// }

const addProfileCosmetic = (
  items: ProfileCosmeticItem[],
  cosmetic: CosmeticStoreItem,
) => {
  if (items.some((item) => item.id === cosmetic.id)) return items;

  return [
    ...items,
    {
      id: cosmetic.id,
      name: cosmetic.name,
      imageUrl: cosmetic.imageUrl,
    },
  ].sort((a, b) => a.name.localeCompare(b.name));
};

const markStoreCosmeticOwned = (
  items: CosmeticStoreItem[],
  cosmeticId: string,
) =>
  items.map((item) =>
    item.id === cosmeticId
      ? {
          ...item,
          owned: true,
        }
      : item,
  );

const formatProfilePv = (value: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value);

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
  user: ProfileUser;
  avatars: ProfileCosmeticItem[];
  banners: ProfileCosmeticItem[];
  frames: ProfileCosmeticItem[];
  activeTournament: ActiveTournamentData | null;
  tournaments: TournamentHistoryItem[];
  deckCounts: DeckCounts;
  cosmeticStoreData: CosmeticStoreData;
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
  store: "Consulta tu saldo y accede a cosméticos canjeables.",
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
  cosmeticStoreData,
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
  const [avatarItems, setAvatarItems] = useState(avatars);
  const [bannerItems, setBannerItems] = useState(banners);
  const [frameItems, setFrameItems] = useState(frames);
  const [storeData, setStoreData] = useState(cosmeticStoreData);
  const [victoryPoints, setVictoryPoints] = useState(
    user.victoryPoints ?? cosmeticStoreData.victoryPoints,
  );

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

  useEffect(() => {
    setAvatarItems(avatars);
  }, [avatars]);

  useEffect(() => {
    setBannerItems(banners);
  }, [banners]);

  useEffect(() => {
    setFrameItems(frames);
  }, [frames]);

  useEffect(() => {
    setStoreData(cosmeticStoreData);
  }, [cosmeticStoreData]);

  useEffect(() => {
    setVictoryPoints(user.victoryPoints ?? cosmeticStoreData.victoryPoints);
  }, [cosmeticStoreData.victoryPoints, user.victoryPoints]);

  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const { data: session, update } = useSession();
  const hasSession = Boolean(session?.user?.idd ?? user.email);

  const handleSelectAvatar = (avatar: ProfileCosmeticItem) => {
    setSelectedAvatar(getAvatarValue(avatar.imageUrl));
  };

  const handleSelectBanner = (banner: ProfileCosmeticItem) => {
    setSelectedBanner(getProfileBannerValue(banner.imageUrl));
  };

  const handleSelectFrame = (frame: ProfileCosmeticItem | null) => {
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

  const handleCosmeticPurchase = (
    cosmetic: CosmeticStoreItem,
    nextVictoryPoints: number,
  ) => {
    setVictoryPoints(nextVictoryPoints);
    setStoreData((current) => ({
      ...current,
      victoryPoints: nextVictoryPoints,
      featured: markStoreCosmeticOwned(current.featured, cosmetic.id),
      items: markStoreCosmeticOwned(current.items, cosmetic.id),
    }));

    if (cosmetic.type === "AVATAR") {
      setAvatarItems((current) => addProfileCosmetic(current, cosmetic));
      return;
    }

    if (cosmetic.type === "BANNER") {
      setBannerItems((current) => addProfileCosmetic(current, cosmetic));
      return;
    }

    setFrameItems((current) => addProfileCosmetic(current, cosmetic));
  };

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
      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-2 sm:px-4 pb-10 pt-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:px-6">
        <ProfileDashboardSidebar
          activeSection={activeSection}
          onChange={handleSectionChange}
          nickname={user.nickname}
          fullName={fullName}
        />

        <main id="perfil-content" className="min-w-0 space-y-6">
          <ProfileSectionHeader
            title={sectionTitles[activeSection]}
            description={sectionDescriptions[activeSection]}
            rightSlot={
              activeSection === "store" ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm dark:border-amber-400/30 dark:bg-amber-500/10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-200/80">
                      PV disponibles
                    </p>
                    <p className="mt-2 text-3xl font-bold text-amber-700 dark:text-amber-100">
                      {formatProfilePv(victoryPoints)} PV
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Temporada actual
                    </p>
                    <p className="mt-2 text-3xl font-bold text-purple-700 dark:text-purple-100">
                      {storeData.currentSeasonNumber}
                    </p>
                  </div>
                </div>
              ) : undefined
            }
          />

          {activeSection === "general" && (
            <ProfileGeneralSection
              user={user}
              fullName={fullName}
              selectedAvatar={selectedAvatar}
              selectedBanner={selectedBanner}
              selectedFrame={selectedFrame}
              matchesPlayed={matchesPlayed}
              winrate={winrate}
              tournamentsPlayed={tournamentsPlayed}
              deckCountToShow={deckCountToShow}
              victoryPoints={victoryPoints}
              onSectionChange={handleSectionChange}
              onTabShortcut={handleTabShortcut}
            />
          )}

          {activeSection === "avatar" && (
            <ProfileAvatarSection
              userImage={user.image}
              selectedAvatar={selectedAvatar}
              selectedFrame={selectedFrame}
              avatarItems={avatarItems}
              frameItems={frameItems}
              hasChanges={hasAvatarChanges}
              onSelectAvatar={handleSelectAvatar}
              onSelectFrame={handleSelectFrame}
              onCancel={cancelAvatarChanges}
              onSave={handleSaveAvatarCosmetics}
            />
          )}

          {activeSection === "banner" && (
            <ProfileBannerSection
              selectedBanner={selectedBanner}
              bannerItems={bannerItems}
              hasChanges={hasBannerChanges}
              onSelectBanner={handleSelectBanner}
              onCancel={cancelBannerChanges}
              onSave={handleSaveBanner}
            />
          )}

          {activeSection === "store" && (
            <ProfileStoreSection
              storeData={storeData}
              onPurchase={handleCosmeticPurchase}
            />
          )}

          {activeSection === "decks" && (
            <ProfileDecksSection hasSession={hasSession} />
          )}

          {activeSection === "tournaments" && (
            <ProfileTournamentsSection
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              tournamentTabLabel={tournamentTabLabel}
              activeTournament={activeTournament}
              fallbackTournamentData={profileTournamentData}
              hasSession={hasSession}
              isPlayer={isPlayer}
              hasTournamentTab={hasTournamentTab}
              showHistoryTab={showHistoryTab}
              tournaments={tournaments}
              selectedTournament={selectedTournament}
              onSelectTournament={handleOpenTournamentFromHistory}
            />
          )}

          {activeSection === "security" && (
            <ProfileSecuritySection hasSession={hasSession} />
          )}
        </main>
      </div>
    </div>
  );
};
