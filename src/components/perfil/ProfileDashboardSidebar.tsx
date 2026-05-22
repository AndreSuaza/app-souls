"use client";

import clsx from "clsx";
import type { IconType } from "react-icons";
import {
  IoColorPaletteOutline,
  IoHomeOutline,
  IoImagesOutline,
  IoLayersOutline,
  IoLockClosedOutline,
  IoPersonCircleOutline,
  IoStorefrontOutline,
  IoTrophyOutline,
} from "react-icons/io5";
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
    description: "Avatar y marco",
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
    description: "PV y cosmeticos",
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
    description: "Contraseña",
    icon: IoLockClosedOutline,
  },
];

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
  return (
    <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
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
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange(item.id)}
                  className={clsx(
                    "group flex min-w-[180px] items-center gap-3 rounded-2xl border px-3 py-3 text-left transition lg:min-w-0 lg:w-full",
                    isActive
                      ? "border-purple-300 bg-purple-100 text-purple-800 shadow-sm dark:border-purple-500/60 dark:bg-purple-600/20 dark:text-purple-100"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:hover:border-tournament-dark-border dark:hover:bg-tournament-dark-muted/70",
                  )}
                >
                  <span
                    className={clsx(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition",
                      isActive
                        ? "border-purple-300 bg-white text-purple-700 dark:border-purple-400/50 dark:bg-purple-500/20 dark:text-purple-100"
                        : "border-slate-200 bg-white text-slate-500 group-hover:text-purple-600 dark:border-tournament-dark-border dark:bg-tournament-dark-bg dark:text-slate-300 dark:group-hover:text-purple-200",
                    )}
                  >
                    <Icon className="h-4 w-4" />
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
            })}
          </div>
        </nav>

        <div className="mt-auto border-t border-slate-200 p-3 dark:border-tournament-dark-border">
          <ButtonLogOut className="flex w-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-red-600 transition hover:border-red-300 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20">
            Cerrar sesion
          </ButtonLogOut>
        </div>
      </div>
    </aside>
  );
};
