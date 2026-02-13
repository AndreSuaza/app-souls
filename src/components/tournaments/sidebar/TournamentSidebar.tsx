"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useUIStore } from "@/store";
import {
  IoAddCircleOutline,
  IoArrowBackOutline,
  IoCloseOutline,
  IoHomeOutline,
  IoNewspaperOutline,
} from "react-icons/io5";
import { IoMdTrophy } from "react-icons/io";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export const TournamentSidebar = () => {
  const isOpen = useUIStore((state) => state.isTournamentSidebarOpen);
  const close = useUIStore((state) => state.closeTournamentSidebar);
  const { data: session } = useSession();
  const role = session?.user?.role;

  const pathname = usePathname();
  const isTournamentSection = pathname.startsWith("/admin/torneos");
  const isNewsSection = pathname.startsWith("/admin/noticias");
  const isAdminRoot = pathname === "/admin" || pathname === "/admin/";

  const menuItems = [
    {
      label: "Inicio",
      href: "/",
      icon: IoHomeOutline,
    },
  ];

  if (isAdminRoot) {
    if (role === "admin") {
      menuItems.push(
        {
          label: "Torneos",
          href: "/admin/torneos",
          icon: IoMdTrophy,
        },
        {
          label: "Noticias",
          href: "/admin/noticias",
          icon: IoNewspaperOutline,
        },
      );
    }
  }

  if (isTournamentSection) {
    if (role === "admin" || role === "store") {
      menuItems.push(
        {
          label: "Crear torneo",
          href: "/admin/torneos/crear-torneo",
          icon: IoAddCircleOutline,
        },
        {
          label: "Torneos",
          href: "/admin/torneos",
          icon: IoMdTrophy,
        },
      );
    }

    if (role === "admin") {
      menuItems.push({
        label: "Panel de administración",
        href: "/admin",
        icon: IoArrowBackOutline,
      });
    }
  }

  if (isNewsSection) {
    if (role === "admin" || role === "news") {
      menuItems.push(
        {
          label: "Crear noticia",
          href: "/admin/noticias/crear-noticia",
          icon: IoAddCircleOutline,
        },
        {
          label: "Noticias",
          href: "/admin/noticias",
          icon: IoNewspaperOutline,
        },
      );
    }

    if (role === "admin") {
      menuItems.push({
        label: "Panel de administración",
        href: "/admin",
        icon: IoArrowBackOutline,
      });
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 right-0 z-40 h-full w-64 bg-white dark:bg-tournament-dark-surface text-slate-900 dark:text-white shadow-sm transition-transform duration-200 flex flex-col lg:static lg:z-auto lg:h-auto lg:w-64 lg:border-r lg:border-tournament-dark-accent dark:lg:border-tournament-dark-border lg:border-l-0 lg:translate-x-0",
          {
            "translate-x-0": isOpen,
            "translate-x-full": !isOpen,
          },
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-tournament-dark-border">
          <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
            Gestor de Torneos
          </span>

          <button onClick={close} className="lg:hidden">
            <IoCloseOutline size={22} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col px-2 lg:px-3 py-4 gap-1">
          {menuItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors",
                  {
                    "lg:justify-start lg:px-4 lg:py-3 lg:gap-3": true,
                    "bg-purple-600 text-white shadow-sm dark:bg-tournament-dark-accent dark:text-white":
                      isActive,
                    "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-tournament-dark-muted hover:text-slate-900 dark:hover:text-white":
                      !isActive,
                  },
                )}
              >
                <Icon size={22} />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-4 lg:hidden">
          <button
            onClick={async () => {
              close();
              await signOut();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-tournament-dark-muted hover:text-slate-900 dark:hover:text-white"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>
    </>
  );
};
