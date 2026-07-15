"use client";

import { useState } from "react";
import clsx from "clsx";
import type { IconType } from "react-icons";
import {
  IoChevronDownOutline,
  IoColorPaletteOutline,
  IoCloseOutline,
  IoHomeOutline,
  IoImagesOutline,
  IoLayersOutline,
  IoLockClosedOutline,
  IoPersonCircleOutline,
  IoStorefrontOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { PLAYER_COSMETIC_STORE_ENABLED } from "@/config/features";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { ButtonLogOut } from "../login/ButtonLogOut";

export type ProfileDashboardSection =
  | "general"
  | "avatar"
  | "banner"
  | "store"
  | "decks"
  | "tournaments"
  | "security";

type SidebarItem = {
  id: ProfileDashboardSection;
  label: string;
  description: string;
  icon: IconType;
};

const sidebarItems: SidebarItem[] = [
  {
    id: "general",
    label: "General",
    description: "Resumen",
    icon: IoHomeOutline,
  },
  {
    id: "avatar",
    label: "Avatar",
    description: "Imagen de perfil",
    icon: IoPersonCircleOutline,
  },
  {
    id: "banner",
    label: "Fondo del perfil",
    description: "Banner",
    icon: IoImagesOutline,
  },
  {
    id: "store",
    label: "Tienda",
    description: "PV y cosméticos",
    icon: IoStorefrontOutline,
  },
  {
    id: "decks",
    label: "Mazos",
    description: "Coleccion",
    icon: IoLayersOutline,
  },
  {
    id: "tournaments",
    label: "Torneos",
    description: "Historial",
    icon: IoTrophyOutline,
  },
  {
    id: "security",
    label: "Seguridad",
    description: "Contrasena",
    icon: IoLockClosedOutline,
  },
];

const visibleSidebarItems = sidebarItems.filter(
  (item) => PLAYER_COSMETIC_STORE_ENABLED || item.id !== "store",
);

type Props = {
  activeSection: ProfileDashboardSection;
  onChange: (section: ProfileDashboardSection) => void;
  nickname?: string | null;
  fullName: string;
};

export const ProfileDashboardSidebar = ({
  activeSection,
  onChange,
  nickname,
  fullName,
}: Props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useBodyScrollLock(isMobileMenuOpen);

  const activeItem =
    visibleSidebarItems.find((item) => item.id === activeSection) ??
    visibleSidebarItems[0];
  const ActiveIcon = activeItem.icon;

  const handleMobileChange = (section: ProfileDashboardSection) => {
    onChange(section);
    setIsMobileMenuOpen(false);
  };

  const renderNavigationItem = (
    item: SidebarItem,
    onSelect: (section: ProfileDashboardSection) => void,
    isMobile = false,
  ) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelect(item.id)}
        className={clsx(
          "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
          isMobile ? "w-full" : "min-w-[180px] lg:min-w-0 lg:w-full",
          isActive
            ? "border-purple-300 bg-purple-100 text-purple-800 shadow-sm dark:border-purple-500/60 dark:bg-purple-600/20 dark:text-purple-100"
            : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:hover:border-tournament-dark-border dark:hover:bg-tournament-dark-muted/70",
        )}
      >
        <span
          className={clsx(
            "flex shrink-0 items-center justify-center rounded-xl border transition",
            isMobile ? "h-10 w-10" : "h-9 w-9",
            isActive
              ? "border-purple-300 bg-white text-purple-700 dark:border-purple-400/50 dark:bg-purple-500/20 dark:text-purple-100"
              : "border-slate-200 bg-white text-slate-500 group-hover:text-purple-600 dark:border-tournament-dark-border dark:bg-tournament-dark-bg dark:text-slate-300 dark:group-hover:text-purple-200",
          )}
        >
          <Icon className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {item.label}
          </span>
          <span className="block truncate text-xs opacity-70">
            {item.description}
          </span>
        </span>
      </button>
    );
  };

  return (
    <>
      <div className="sticky top-3 z-30 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isMobileMenuOpen}
          className="flex w-full items-center justify-between rounded-2xl border border-purple-300 bg-purple-600/95 p-3 text-left text-white shadow-lg shadow-purple-900/25 backdrop-blur transition hover:bg-purple-500 dark:border-purple-500/70 dark:bg-purple-700/80 dark:shadow-black/30"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white">
              <ActiveIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-purple-100">
                Seccion de perfil
              </span>
              <span className="mt-0.5 block truncate text-base font-semibold text-white">
                {activeItem.label}
              </span>
            </span>
          </span>
          <span className="ml-3 inline-flex shrink-0 items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
            Cambiar
            <IoChevronDownOutline className="h-4 w-4" />
          </span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navegacion de perfil"
          className="fixed inset-0 z-[80] lg:hidden"
        >
          <button
            type="button"
            aria-label="Cerrar menu de perfil"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[84vh] overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-tournament-dark-border">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-500/40 dark:bg-purple-500/15 dark:text-purple-200">
                  <IoColorPaletteOutline className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                    {nickname || "Jugador"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {fullName || "Perfil Souls"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Cerrar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-purple-300 hover:text-purple-700 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:border-purple-500 dark:hover:text-purple-100"
              >
                <IoCloseOutline className="h-6 w-6" />
              </button>
            </div>

            <div className="max-h-[calc(84vh-9rem)] overflow-y-auto p-3">
              <nav className="space-y-2">
                {visibleSidebarItems.map((item) =>
                  renderNavigationItem(item, handleMobileChange, true),
                )}
              </nav>
            </div>

            <div className="border-t border-slate-200 mb-5 px-3 py-1.5 dark:border-tournament-dark-border">
              <ButtonLogOut className="flex w-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-red-600 transition hover:border-red-300 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20">
                Cerrar sesión
              </ButtonLogOut>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden lg:sticky lg:top-6 lg:block lg:h-[calc(100vh-3rem)]">
        <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-xl shadow-slate-200/70 backdrop-blur dark:border-tournament-dark-border dark:bg-tournament-dark-surface/80 dark:shadow-black/20">
          <div className="border-b border-slate-200 p-5 dark:border-tournament-dark-border">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-500/40 dark:bg-purple-500/15 dark:text-purple-200">
                <IoColorPaletteOutline className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                  {nickname || "Jugador"}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {fullName || "Perfil Souls"}
                </p>
              </div>
            </div>
          </div>

          <nav className="min-h-0 flex-1 space-y-1 overflow-x-auto overflow-y-auto p-3 lg:overflow-x-visible">
            <div className="flex gap-2 lg:block lg:space-y-1">
              {visibleSidebarItems.map((item) =>
                renderNavigationItem(item, onChange),
              )}
            </div>
          </nav>

          <div className="mt-auto border-t border-slate-200 p-3 dark:border-tournament-dark-border">
            <ButtonLogOut className="flex w-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-red-600 transition hover:border-red-300 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20">
              Cerrar sesión
            </ButtonLogOut>
          </div>
        </div>
      </aside>
    </>
  );
};
