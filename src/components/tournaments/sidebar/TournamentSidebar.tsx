"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useUIStore } from "@/store";
import {
  IoAddCircleOutline,
  IoMenuOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { IoMdTrophy } from "react-icons/io";

export const TournamentSidebar = () => {
  const isOpen = useUIStore((state) => state.isTournamentSidebarOpen);
  const open = useUIStore((state) => state.openTournamentSidebar);
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
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar spacer (reserva espacio en el layout) */}
      <div
        className={clsx("lg:hidden transition-all duration-200", {
          "w-14": true, // Siempre reserva el espacio colapsado
        })}
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          "absolute lg:relative min-h-screen lg:h-auto z-30 bg-white border-r shadow-sm transition-all duration-200 flex flex-col",
          {
            // MOBILE
            "w-14": !isOpen,
            "w-64": isOpen,

            // DESKTOP
            "lg:w-64": true,
          }
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span
            className={clsx(
              "font-bold text-black whitespace-nowrap transition-opacity",
              {
                "opacity-0 w-0 overflow-hidden": !isOpen,
                "opacity-100 w-auto": isOpen,
              },
              "lg:opacity-100 lg:w-auto"
            )}
          >
            Gestor de Torneos
          </span>

          <button onClick={isOpen ? close : open} className="lg:hidden">
            {isOpen ? (
              <IoCloseOutline size={22} />
            ) : (
              <IoMenuOutline size={22} />
            )}
          </button>
        </div>

        <nav className="flex flex-col px-2 lg:px-3 py-4 gap-1">
          {menuItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={clsx(
                  "flex items-center rounded-lg font-medium transition-colors",
                  {
                    // Mobile collapsed
                    "justify-center py-2": !isOpen,

                    // Mobile open + Desktop
                    "gap-3 px-4 py-3 justify-start": isOpen,

                    // Desktop siempre alineado a la izquierda
                    "lg:justify-start lg:px-4 lg:py-3 lg:gap-3": true,

                    "bg-indigo-100 text-indigo-600": isActive,
                    "text-gray-600 hover:bg-gray-100 hover:text-gray-900":
                      !isActive,
                  }
                )}
              >
                <Icon size={22} />

                <span
                  className={clsx(
                    "whitespace-nowrap transition-opacity",
                    {
                      // Mobile collapsed
                      "opacity-0 w-0 overflow-hidden": !isOpen,

                      // Mobile open + Desktop
                      "opacity-100 w-auto": isOpen,
                    },
                    "lg:opacity-100 lg:w-auto"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
