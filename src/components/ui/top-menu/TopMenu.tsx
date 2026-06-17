"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  IoCloseOutline,
  IoLogInOutline,
  IoMenuSharp,
  IoPersonCircleOutline,
} from "react-icons/io5";
import { titleFont } from "@/config/fonts";
import { Routes, type Route } from "@/models/routes.models";
import { useUIStore } from "@/store";
import { getAvatarUrl } from "@/utils/avatar-image";

const visibleRoutes = Routes.filter((route) => route.name !== "");

export const TopMenu = () => {
  const isSideMenuOpen = useUIStore((state) => state.isSideMenuOpen);
  const openMenu = useUIStore((state) => state.openSideMenu);
  const closeMenu = useUIStore((state) => state.closeSideMenu);
  const [openRoute, setOpenRoute] = useState<Route | null>(null);
  const [pinnedRouteName, setPinnedRouteName] = useState<string | null>(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [dropdownArrowLeft, setDropdownArrowLeft] = useState(0);
  const closeMenuTimeoutRef = useRef<number | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();

  const adminShortcut = (() => {
    const role = session?.user?.role;
    if (role === "admin") return { label: "Administrar", href: "/admin" };
    if (role === "store") return { label: "Torneos", href: "/admin/torneos" };
    if (role === "news") return { label: "Noticias", href: "/admin/noticias" };
    return null;
  })();

  const clearCloseMenuTimeout = () => {
    if (closeMenuTimeoutRef.current !== null) {
      window.clearTimeout(closeMenuTimeoutRef.current);
      closeMenuTimeoutRef.current = null;
    }
  };

  const scheduleCloseMenu = () => {
    if (pinnedRouteName) return;

    clearCloseMenuTimeout();
    closeMenuTimeoutRef.current = window.setTimeout(() => {
      setOpenRoute(null);
      closeMenuTimeoutRef.current = null;
    }, 140);
  };

  useEffect(() => {
    const handleClickOutsideProfile = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideProfile);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideProfile);
  }, []);

  useEffect(() => {
    return () => {
      clearCloseMenuTimeout();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const openRouteMenu = (route: Route, trigger: HTMLElement) => {
    if (!route.menu?.length) {
      setOpenRoute(null);
      setPinnedRouteName(null);
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setDropdownArrowLeft(rect.left + rect.width / 2);
    setOpenRoute(route);
  };

  const closeRouteMenu = () => {
    setOpenRoute(null);
    setPinnedRouteName(null);
  };

  const handleRouteClick = (route: Route, trigger: HTMLElement) => {
    const isSameOpenRoute = openRoute?.name === route.name;
    const isPinnedRoute = pinnedRouteName === route.name;

    if (isSameOpenRoute && isPinnedRoute) {
      closeRouteMenu();
      return;
    }

    clearCloseMenuTimeout();
    openRouteMenu(route, trigger);
    setPinnedRouteName(route.name);
  };

  const handleDropdownMouseLeave = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isLeavingThroughBottom = event.clientY >= rect.bottom - 1;

    if (isLeavingThroughBottom) {
      closeRouteMenu();
      return;
    }

    scheduleCloseMenu();
  };

  return (
    <header
      className="sticky top-0 z-50 bg-[#080a0d] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      onMouseLeave={scheduleCloseMenu}
    >
      <nav className="relative flex h-[68px] items-center justify-between px-4 sm:px-6 lg:h-[64px] lg:px-8">
        <div className="flex h-full min-w-0 items-center gap-8">
          <Link
            href="/"
            title="Ir al inicio"
            className="group flex min-w-0 items-center gap-3"
            onMouseEnter={() => {
              clearCloseMenuTimeout();
              closeRouteMenu();
            }}
          >
            <Image
              src="/souls-in-xtinction-logo-sm.png"
              alt="Logo Souls In Xtinction"
              title="Souls In Xtinction | TCG"
              className="h-10 w-10 shrink-0 drop-shadow-[0_0_12px_rgba(147,51,234,0.35)]"
              width={40}
              height={40}
              priority
            />
            <span
              className={`${titleFont.className} max-w-[210px] truncate text-base font-bold tracking-wide antialiased sm:max-w-[260px] sm:text-xl xl:max-w-none`}
            >
              Souls In Xtinction | TCG
            </span>
          </Link>

          <ul className="hidden h-full items-center lg:flex">
            {visibleRoutes.map((route) => {
              const isOpen = openRoute?.name === route.name;

              return (
                <li
                  key={route.name}
                  className="flex h-full items-center"
                  onMouseEnter={(event) => {
                    clearCloseMenuTimeout();
                    setPinnedRouteName((current) =>
                      current === route.name ? current : null,
                    );
                    openRouteMenu(route, event.currentTarget);
                  }}
                >
                  {route.menu?.length ? (
                    <button
                      type="button"
                      title={`Abrir menu ${route.name}`}
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                      onClick={(event) =>
                        handleRouteClick(route, event.currentTarget)
                      }
                      className="relative flex h-full items-center px-3 text-sm font-black uppercase tracking-wide transition hover:text-yellow-400 xl:px-4"
                    >
                      {route.name}
                    </button>
                  ) : (
                    <Link
                      href={route.path ?? "/"}
                      title={`Ir a ${route.name}`}
                      className="relative flex h-full items-center px-3 text-sm font-black uppercase tracking-wide transition hover:text-yellow-400 xl:px-4"
                      onMouseEnter={() => closeRouteMenu()}
                    >
                      {route.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {session ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setOpenProfile((current) => !current)}
                onMouseEnter={() => closeRouteMenu()}
                className="flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-950/40 px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition hover:border-yellow-400 hover:text-yellow-400"
                title="Abrir menu de cuenta"
                aria-haspopup="menu"
                aria-expanded={openProfile}
              >
                {session.user.image ? (
                  <Image
                    src={getAvatarUrl(session.user.image)}
                    alt="Imagen de perfil"
                    title={`Avatar de ${session.user.nickname ?? "usuario"}`}
                    className="h-7 w-7 rounded-full border border-purple-400/50 object-cover"
                    width={56}
                    height={56}
                  />
                ) : (
                  <IoPersonCircleOutline className="h-6 w-6" />
                )}
                <span className="max-w-[120px] truncate">
                  {session.user.nickname ?? "Cuenta"}
                </span>
              </button>

              {openProfile && (
                <ul className="absolute right-0 top-full mt-3 w-48 overflow-hidden rounded-xl border border-purple-700/60 bg-[#050507] py-2 shadow-2xl shadow-black/50">
                  <li>
                    <Link
                      href="/perfil"
                      title="Ir a tu perfil"
                      onClick={() => setOpenProfile(false)}
                      className="block px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-purple-950/60 hover:text-yellow-400"
                    >
                      Tu perfil
                    </Link>
                  </li>
                  {adminShortcut && (
                    <li>
                      <Link
                        href={adminShortcut.href}
                        title={`Ir a ${adminShortcut.label}`}
                        onClick={() => setOpenProfile(false)}
                        className="block px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-purple-950/60 hover:text-yellow-400"
                      >
                        {adminShortcut.label}
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      title="Cerrar sesión"
                      className="block w-full px-4 py-2 text-left text-sm font-semibold text-slate-200 transition hover:bg-purple-950/60 hover:text-yellow-400"
                    >
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              title="Iniciar sesión"
              className="inline-flex items-center gap-2 rounded-full border border-yellow-400/70 bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-wide text-black transition hover:bg-yellow-300"
              onMouseEnter={() => closeRouteMenu()}
            >
              <IoLogInOutline className="h-4 w-4" />
              Iniciar sesión
            </Link>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-800/70 text-white transition hover:border-yellow-400 hover:text-yellow-400 lg:hidden"
          onClick={isSideMenuOpen ? closeMenu : openMenu}
          title={isSideMenuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-label={isSideMenuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={isSideMenuOpen}
        >
          <span className="relative flex h-7 w-7 items-center justify-center">
            <IoMenuSharp
              className={`absolute h-7 w-7 transition duration-200 ${
                isSideMenuOpen
                  ? "rotate-90 scale-75 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
              }`}
            />
            <IoCloseOutline
              className={`absolute h-7 w-7 transition duration-200 ${
                isSideMenuOpen
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-75 opacity-0"
              }`}
            />
          </span>
        </button>
      </nav>

      {openRoute?.menu?.length && (
        <span className="absolute inset-x-0 bottom-0 hidden h-0.5 bg-yellow-400 lg:block" />
      )}

      {openRoute?.menu?.length && (
        <div
          role="menu"
          onMouseEnter={clearCloseMenuTimeout}
          onMouseLeave={handleDropdownMouseLeave}
          className="absolute inset-x-0 top-full hidden bg-black px-8 py-8 shadow-2xl shadow-black/60 lg:block"
        >
          <span
            className="absolute top-0 h-0 w-0 -translate-x-1/2 -translate-y-full border-x-[12px] border-b-[12px] border-x-transparent border-b-yellow-400"
            style={{ left: `${dropdownArrowLeft}px` }}
          />
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 inline-block">
              <p className="text-base uppercase tracking-wide text-white">
                {openRoute.name}
              </p>
              <span className="mt-1 block h-0.5 w-8 bg-yellow-400" />
            </div>

            <ul className="flex max-w-xs flex-col gap-3">
              {openRoute.menu.map((item) =>
                item.path ? (
                  <li key={item.name}>
                    <Link
                      href={item.path}
                      title={`Ir a ${item.name}`}
                      onClick={() => closeRouteMenu()}
                      className="text-base font-semibold text-slate-300 transition hover:text-yellow-400"
                    >
                      {item.name}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};
