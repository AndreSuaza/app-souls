"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  IoBagRemoveOutline,
  IoBookOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoColorWandOutline,
  IoFlashOutline,
  IoLayers,
  IoLogInOutline,
  IoLogOutOutline,
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTiktok,
  IoLogoYoutube,
  IoNewspaperOutline,
  IoPersonCircleOutline,
  IoRefreshOutline,
  IoStorefrontOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { resetEloSeasonAction } from "@/actions";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { Routes } from "@/models/routes.models";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";

const visibleRoutes = Routes.filter((route) => route.name !== "");

export const Sidebar = () => {
  const isSideMenuOpen = useUIStore((state) => state.isSideMenuOpen);
  const closeMenu = useUIStore((state) => state.closeSideMenu);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const { data: session } = useSession();
  const pathname = usePathname();
  const [activeRouteName, setActiveRouteName] = useState<string | null>(null);
  const openAlertConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);

  useBodyScrollLock(isSideMenuOpen);

  const adminShortcut = (() => {
    const role = session?.user?.role;
    if (role === "admin") return { label: "Administrar", href: "/admin" };
    if (role === "store") return { label: "Torneos", href: "/admin/torneos" };
    if (role === "news") return { label: "Noticias", href: "/admin/noticias" };
    return null;
  })();

  const isAdmin = session?.user?.role === "admin";
  const isAdminPanel = pathname.startsWith("/admin");

  const sectionIcons: Record<string, typeof IoFlashOutline> = {
    "Juega Souls": IoFlashOutline,
    Noticias: IoNewspaperOutline,
    Cartas: IoBookOutline,
    Mazos: IoLayers,
    Torneos: IoTrophyOutline,
    Productos: IoBagRemoveOutline,
    Tienda: IoColorWandOutline,
    Tiendas: IoStorefrontOutline,
  };

  const activeRoute = useMemo(
    () =>
      visibleRoutes.find(
        (route) => route.name === activeRouteName && route.menu?.length,
      ) ?? null,
    [activeRouteName],
  );

  const handleClose = () => {
    setActiveRouteName(null);
    closeMenu();
  };

  const handleSignOut = async () => {
    await signOut();
    handleClose();
  };

  const handleResetElo = () => {
    openAlertConfirmation({
      text: "Reiniciar Elo de jugadores?",
      description:
        "Se guardara el Elo actual en el historico y todos los jugadores quedaran en 0.",
      action: async () => {
        try {
          showLoading("Reiniciando Elo...");
          const result = await resetEloSeasonAction({});
          hideLoading();
          if (!result.ok) return false;
          showToast(
            `Elo reiniciado. Temporada ${result.seasonNumber}.`,
            "success",
          );
          return true;
        } catch {
          hideLoading();
          return false;
        }
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo reiniciar el Elo.", "error");
      },
    });
  };

  return (
    <div>
      {isSideMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menu"
          onClick={handleClose}
          className="fixed inset-x-0 bottom-0 top-[68px] z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <nav
        aria-label="Menu principal"
        className={clsx(
          "fixed right-0 top-[68px] z-40 flex h-[calc(100dvh-68px)] w-[86vw] max-w-[340px] flex-col overflow-hidden border-l border-purple-900/70 bg-black text-white shadow-2xl shadow-black/60 transition-transform duration-300 lg:hidden",
          !isSideMenuOpen && "translate-x-full",
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          {activeRoute ? (
            <div className="px-7 py-5">
              <button
                type="button"
                onClick={() => setActiveRouteName(null)}
                className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white"
              >
                <IoChevronBackOutline className="h-5 w-5" />
                <span className="border-b-2 border-yellow-400 pb-1">
                  {activeRoute.name}
                </span>
              </button>

              <div className="flex flex-col gap-1">
                {activeRoute.menu?.map((item) =>
                  item.path ? (
                    <Link
                      key={item.name}
                      href={item.path}
                      title={`Ir a ${item.name}`}
                      onClick={handleClose}
                      className="rounded-md px-1 py-2.5 text-sm font-semibold text-slate-200 transition hover:text-yellow-400"
                    >
                      {item.name}
                    </Link>
                  ) : null,
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 py-3">
                {visibleRoutes.map((route) => {
                  const Icon = sectionIcons[route.name];

                  if (route.menu?.length) {
                    return (
                      <button
                        key={route.name}
                        type="button"
                        onClick={() => setActiveRouteName(route.name)}
                        className="flex w-full items-center gap-3 px-7 py-3 text-left text-sm font-black uppercase tracking-wide transition hover:text-yellow-400"
                        title={`Abrir ${route.name}`}
                      >
                        {Icon && <Icon className="h-5 w-5 shrink-0" />}
                        <span>{route.name}</span>
                        <IoChevronForwardOutline className="ml-auto h-5 w-5" />
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={route.name}
                      href={route.path ?? "/"}
                      title={`Ir a ${route.name}`}
                      onClick={handleClose}
                      className="flex items-center gap-3 px-7 py-3 text-sm font-black uppercase tracking-wide transition hover:text-yellow-400"
                    >
                      {Icon && <Icon className="h-5 w-5 shrink-0" />}
                      {route.name}
                    </Link>
                  );
                })}
              </div>

              <div className="py-3">
                {session ? (
                  <>
                    <Link
                      href="/perfil"
                      title="Ir a tu perfil"
                      className="flex items-center gap-3 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-slate-200 transition hover:text-yellow-400"
                      onClick={handleClose}
                    >
                      <IoPersonCircleOutline className="h-5 w-5" />
                      Tu perfil
                    </Link>

                    {adminShortcut && (
                      <Link
                        href={adminShortcut.href}
                        title={`Ir a ${adminShortcut.label}`}
                        className="flex items-center gap-3 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-slate-200 transition hover:text-yellow-400"
                        onClick={handleClose}
                      >
                        <IoTrophyOutline className="h-5 w-5" />
                        {adminShortcut.label}
                      </Link>
                    )}

                    {isAdmin && isAdminPanel && (
                      <button
                        type="button"
                        onClick={handleResetElo}
                        title="Reiniciar Elo global"
                        className="flex w-full items-center gap-3 px-7 py-3 text-left text-sm font-semibold uppercase tracking-wide text-red-300 transition hover:text-red-200"
                      >
                        <IoRefreshOutline className="h-5 w-5" />
                        Reiniciar Elo
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 px-7 py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-200 transition hover:text-yellow-400"
                    >
                      <IoLogOutOutline className="h-5 w-5" />
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    title="Iniciar sesión"
                    className="flex items-center gap-3 px-7 py-3 text-sm font-black uppercase tracking-wide text-yellow-400 transition hover:text-yellow-300"
                    onClick={handleClose}
                  >
                    <IoLogInOutline className="h-5 w-5" />
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-auto flex shrink-0 gap-4 border-t border-white/10 px-7 py-5">
          <Link
            href="https://www.instagram.com/soulsinxtinction"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
          >
            <IoLogoInstagram className="h-5 w-5 transition hover:text-yellow-400" />
          </Link>
          <Link
            href="https://www.facebook.com/soulsinxtinction"
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook"
          >
            <IoLogoFacebook className="h-5 w-5 transition hover:text-yellow-400" />
          </Link>
          <Link
            href="https://www.youtube.com/@SoulsInXtinction"
            target="_blank"
            rel="noopener noreferrer"
            title="YouTube"
          >
            <IoLogoYoutube className="h-5 w-5 transition hover:text-yellow-400" />
          </Link>
          <Link
            href="https://www.tiktok.com/@soulsinxtinction"
            target="_blank"
            rel="noopener noreferrer"
            title="TikTok"
          >
            <IoLogoTiktok className="h-5 w-5 transition hover:text-yellow-400" />
          </Link>
        </div>
      </nav>
    </div>
  );
};
