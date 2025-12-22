"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useUIStore } from "@/store";
import {
  IoAddCircleOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { IoMdTrophy } from "react-icons/io";
import { signOut } from "next-auth/react";

export const TournamentSidebar = () => {
  const isOpen = useUIStore((state) => state.isTournamentSidebarOpen);
  const close = useUIStore((state) => state.closeTournamentSidebar);

  const pathname = usePathname();

  const menuItems = [
    {
      label: "Nuevo torneo",
      href: "/administrador/torneos/crear-torneo",
      icon: IoAddCircleOutline,
    },
    {
      label: "Torneos",
      href: "/administrador/torneos",
      icon: IoMdTrophy,
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 right-0 z-40 h-full w-64 bg-white shadow-sm transition-transform duration-200 flex flex-col md:static md:z-auto md:h-auto md:w-64 md:border-r md:border-l-0 md:translate-x-0",
          {
            "translate-x-0": isOpen,
            "translate-x-full": !isOpen,
          }
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-black whitespace-nowrap">
            Gestor de Torneos
          </span>

          <button onClick={close} className="md:hidden">
            <IoCloseOutline size={22} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col px-2 md:px-3 py-4 gap-1">
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
                    "bg-indigo-100 text-indigo-600": isActive,
                    "text-gray-600 hover:bg-gray-100 hover:text-gray-900":
                      !isActive,
                  }
                )}
              >
                <Icon size={22} />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-4 md:hidden">
          <button
            onClick={async () => {
              close();
              await signOut();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Cerrar sesion
          </button>
        </div>
      </aside>
    </>
  );
};
