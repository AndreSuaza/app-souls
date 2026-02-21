"use client";

import { useState } from "react";
import { useUIStore } from "@/store";
import { Routes } from "@/models/routes.models";
import clsx from "clsx";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  IoBagRemoveOutline,
  IoBookOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoFlashOutline,
  IoLayers,
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTiktok,
  IoLogoYoutube,
  IoLogInOutline,
  IoLogOutOutline,
  IoTrophyOutline,
} from "react-icons/io5";

export const Sidebar = () => {
  const isSideMenuOpen = useUIStore((state) => state.isSideMenuOpen);
  const closeMenu = useUIStore((state) => state.closeSideMenu);
  const { data: session } = useSession();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const adminShortcut = (() => {
    const role = session?.user?.role;
    if (role === "admin") {
      return { label: "Administrar", href: "/admin" };
    }
    if (role === "store") {
      return { label: "Torneos", href: "/admin/torneos" };
    }
    if (role === "news") {
      return { label: "Noticias", href: "/admin/noticias" };
    }
    return null;
  })();

  const handleClick = async () => {
    await signOut();
  };

  const sectionIcons: Record<string, typeof IoFlashOutline> = {
    Jugar: IoFlashOutline,
    Cartas: IoBookOutline,
    Mazos: IoLayers,
    Torneos: IoTrophyOutline,
    Productos: IoBagRemoveOutline,
  };

  const toggleSection = (name: string) => {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div>
      {/* Background black*/}
      {isSideMenuOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen z-20 bg-black opacity-30" />
      )}

      {isSideMenuOpen && (
        <div
          onClick={closeMenu}
          className="fade-in fixed top-0 left-0 w-screen h-screen z-20 backdrop-filter backdrop-blur-sm"
        />
      )}

      {/* Sidemenu */}
      <nav
        className={clsx(
          "fixed p-5 right-0 top-0 w-4/6 h-screen bg-slate-900 text-white z-30 shadow-2xl transform transition-all duration-200",
          {
            "translate-x-full": !isSideMenuOpen,
          },
        )}
      >
        <IoCloseOutline
          size={50}
          className="absolute top-5 right-5 cursor-pointer"
          onClick={closeMenu}
        />

        <div className="flex flex-col mt-12">
          {/* <Link
            className="flex m-2 p-2 transition-all uppercase text-yellow-400 font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600"
            href="/nacional"
            onClick={closeMenu}
          >
            <IoTrophyOutline className="w-6 h-6 mr-3" />
            Torneo Nacional
          </Link> */}
          {Routes.map((route) => {
            const Icon = sectionIcons[route.name];

            if (route.menu?.length) {
              const isOpen = Boolean(openSections[route.name]);
              return (
                <div key={route.name} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleSection(route.name)}
                    className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600"
                    aria-expanded={isOpen}
                  >
                    {Icon && <Icon className="w-6 h-6 mr-3" />}
                    <span>{route.name}</span>
                    <IoChevronDownOutline
                      className={clsx(
                        "ml-auto h-5 w-5 transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    className={clsx(
                      "ml-10 flex flex-col gap-1 overflow-hidden transition-all duration-200",
                      isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    {route.menu.map((item) => (
                      <Link
                        key={`${route.name}-${item.name}`}
                        href={item.path ?? "/"}
                        onClick={closeMenu}
                        className="rounded-md px-2 py-1 text-xs font-semibold uppercase text-slate-200 transition-all hover:text-yellow-600"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={route.name}
                className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600"
                href={route.path ?? "/"}
                onClick={closeMenu}
              >
                {Icon && <Icon className="w-6 h-6 mr-3" />}
                {route.name}
              </Link>
            );
          })}

          <div className="flex flex-row mt-6 border-t-2 pt-4">
            <Link
              href="https://www.instagram.com/soulsinxtinction"
              target="blank"
            >
              <IoLogoInstagram className="w-6 h-6 ml-4 transition-all hover:text-yellow-600" />
            </Link>
            <Link
              href="https://www.facebook.com/soulsinxtinction"
              target="blank"
            >
              <IoLogoFacebook className="w-6 h-6 ml-4 transition-all hover:text-yellow-600" />
            </Link>
            <Link
              href="https://www.youtube.com/@SoulsInXtinction"
              target="blank"
            >
              <IoLogoYoutube className="w-6 h-6 ml-4 transition-all hover:text-yellow-600" />
            </Link>
            <Link
              href="https://www.tiktok.com/@soulsinxtinction"
              target="blank"
            >
              <IoLogoTiktok className="w-6 h-6 ml-4 transition-all hover:text-yellow-600" />
            </Link>
          </div>
          {session ? (
            <div className="mt-6 border-t-2 pt-4">
              <Link
                href="/perfil"
                className="block w-full h-full mb-2 mt-2 p-1  pl-6 md:pl-0 hover:bg-gray-800 transition-transform"
                onClick={closeMenu}
              >
                Tu perfil
              </Link>

              {adminShortcut && (
                <Link
                  href={adminShortcut.href}
                  className="block w-full h-full mb-2 mt-2 p-1  pl-6 md:pl-0 hover:bg-gray-800 transition-transform"
                  onClick={closeMenu}
                >
                  {adminShortcut.label}
                </Link>
              )}

              <button
                onClick={handleClick}
                className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600"
              >
                <IoLogOutOutline className="w-6 h-6 mr-3" />
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="mt-6 border-t-2 pt-4">
              <Link
                href="/auth/login"
                className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600"
                onClick={closeMenu}
              >
                <IoLogInOutline className="w-6 h-6 mr-3" />
                Iniciar sesión
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};
