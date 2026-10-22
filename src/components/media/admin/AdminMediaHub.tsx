"use client";

import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import {
  IoBagHandleOutline,
  IoCalendarOutline,
  IoImageOutline,
  IoImagesOutline,
  IoNewspaperOutline,
  IoPersonCircleOutline,
} from "react-icons/io5";
import { AdminMediaManager } from "@/components/media/admin/AdminMediaManager";
import { ProfileMediaManager } from "@/components/media/admin/ProfileMediaManager";

const mediaGroups = [
  {
    id: "cosmetics",
    label: "Cosméticos",
    href: "/admin/medios?section=cosmetics",
    icon: IoPersonCircleOutline,
  },
  {
    id: "news",
    label: "Noticias",
    href: "/admin/medios?group=news",
    icon: IoNewspaperOutline,
  },
  {
    id: "events",
    label: "Eventos",
    href: "/admin/medios?group=events",
    icon: IoCalendarOutline,
  },
  {
    id: "products",
    label: "Productos",
    href: "/admin/medios?group=products",
    icon: IoBagHandleOutline,
  },
] as const;

const cosmeticTabs = [
  {
    id: "avatars",
    label: "Avatares",
    section: "profile-avatars",
    type: "AVATAR",
    icon: IoPersonCircleOutline,
  },
  {
    id: "banners",
    label: "Banners",
    section: "profile-banners",
    type: "BANNER",
    icon: IoImageOutline,
  },
  {
    id: "frames",
    label: "Marcos",
    section: "profile-frames",
    type: "FRAME",
    icon: IoImagesOutline,
  },
] as const;

type MediaView = (typeof mediaGroups)[number]["id"];
type CosmeticTab = (typeof cosmeticTabs)[number];

type Props = {
  initialView?: MediaView;
};

export const AdminMediaHub = ({ initialView = "news" }: Props) => {
  const [activeCosmeticTabId, setActiveCosmeticTabId] = useState<
    CosmeticTab["id"]
  >(cosmeticTabs[0].id);
  const activeCosmeticTab =
    cosmeticTabs.find((tab) => tab.id === activeCosmeticTabId) ?? cosmeticTabs[0];
  const isCosmetics = initialView === "cosmetics";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Imágenes y cosméticos
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gestiona las imágenes almacenadas y los cosméticos del perfil desde un
          mismo módulo.
        </p>
      </header>

      <div>
        <div className="flex flex-wrap items-end gap-2 border-b border-tournament-dark-accent dark:border-tournament-dark-border">
          {mediaGroups.map((group) => {
            const isActive = group.id === initialView;
            const Icon = group.icon;

            return (
              <Link
                key={group.id}
                href={group.href}
                className={clsx(
                  "relative -mb-px inline-flex items-center gap-2 rounded-t-xl border border-b-0 px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "border-purple-500 bg-white text-purple-700 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-purple-200"
                    : "border-tournament-dark-accent bg-slate-100 text-slate-500 hover:border-purple-400 hover:text-slate-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300 dark:hover:bg-tournament-dark-muted-strong dark:hover:text-purple-100",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{group.label}</span>
              </Link>
            );
          })}
        </div>

        {isCosmetics ? (
          <section className="space-y-5 rounded-b-2xl border border-tournament-dark-accent border-t-0 bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <div className="flex flex-wrap gap-2">
              {cosmeticTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeCosmeticTabId;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCosmeticTabId(tab.id)}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide",
                      isActive
                        ? "border-purple-500 bg-purple-100 text-purple-700 dark:bg-purple-600/20 dark:text-purple-200"
                        : "border-tournament-dark-accent bg-white text-slate-600 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <ProfileMediaManager
              section={activeCosmeticTab.section}
              type={activeCosmeticTab.type}
            />
          </section>
        ) : (
          <AdminMediaManager
            key={initialView}
            initialGroup={initialView}
            showGroupTabs={false}
            showHeader={false}
          />
        )}
      </div>
    </div>
  );
};
