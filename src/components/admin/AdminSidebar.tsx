"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useUIStore } from "@/store";
import {
  IoBagRemoveOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoAnalyticsOutline,
  IoGiftOutline,
  IoGameControllerOutline,
  IoHomeOutline,
  IoImagesOutline,
  IoLayersOutline,
  IoMenuSharp,
  IoLogOutOutline,
  IoNewspaperOutline,
  IoPeopleOutline,
  IoRibbonOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { TbCards } from "react-icons/tb";
import { useSession } from "next-auth/react";
import { signOutOnce } from "@/lib/client-sign-out";

type AdminRole = "admin" | "store" | "news";

type AdminNavItem = {
  label: string;
  href: string;
  icon: typeof IoHomeOutline;
};

type AdminNavGroup = {
  id: string;
  label: string;
  icon: typeof IoHomeOutline;
  items: AdminNavItem[];
};

const isPathActive = (pathname: string, href: string) => {
  const [hrefPath] = href.split("?");

  return hrefPath === "/admin"
    ? pathname === "/admin" || pathname === "/admin/"
    : pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
};

const getAdminNavigation = (role?: string | null) => {
  const normalizedRole = role as AdminRole | undefined;

  if (normalizedRole === "admin") {
    return [
      {
        id: "dashboards",
        label: "Dashboards",
        icon: IoAnalyticsOutline,
        items: [
          { label: "General", href: "/admin", icon: IoHomeOutline },
          { label: "Torneos", href: "/admin/torneos/dashboard", icon: IoTrophyOutline },
          { label: "Usuarios", href: "/admin/usuarios/dashboard", icon: IoPeopleOutline },
          { label: "Simulador", href: "/admin/simulador/dashboard", icon: IoAnalyticsOutline },
          { label: "PV", href: "/admin/pv/dashboard", icon: IoRibbonOutline },
        ],
      },
      {
        id: "operations",
        label: "Operación",
        icon: IoTrophyOutline,
        items: [
          { label: "Torneos", href: "/admin/torneos", icon: IoTrophyOutline },
          { label: "Eventos", href: "/admin/eventos", icon: IoCalendarOutline },
          { label: "Administrar simulador", href: "/admin/simulador/administracion", icon: IoGameControllerOutline },
        ],
      },
      {
        id: "content",
        label: "Contenido",
        icon: IoNewspaperOutline,
        items: [
          { label: "Noticias", href: "/admin/noticias", icon: IoNewspaperOutline },
          { label: "Productos", href: "/admin/productos", icon: IoBagRemoveOutline },
          {
            label: "Imágenes y cosméticos",
            href: "/admin/medios",
            icon: IoImagesOutline,
          },
        ],
      },
      {
        id: "community",
        label: "Comunidad",
        icon: IoPeopleOutline,
        items: [
          { label: "Usuarios", href: "/admin/usuarios", icon: IoPeopleOutline },
          { label: "Mazos", href: "/admin/mazos", icon: IoLayersOutline },
          { label: "Cartas", href: "/admin/cartas", icon: TbCards },
          {
            label: "Importar cartas",
            href: "/admin/cartas/importar-cartas",
            icon: TbCards,
          },
          {
            label: "Actualizar imágenes",
            href: "/admin/cartas/actualizar-imagenes",
            icon: IoImagesOutline,
          },
        ],
      },
      {
        id: "rewards",
        label: "Recompensas",
        icon: IoGiftOutline,
        items: [
          {
            label: "Pase de batalla",
            href: "/admin/pase-batalla",
            icon: IoGiftOutline,
          },
          {
            label: "Progreso por jugador",
            href: "/admin/pase-batalla/progreso-jugadores",
            icon: IoPeopleOutline,
          },
        ],
      },
      /*
       * La administración de tienda queda oculta temporalmente, pero sus
       * rutas y componentes se conservan para una futura reactivación.
       * Tienda: /admin/tienda
       * Ventas: /admin/tienda/ventas
       * Configuración: /admin/tienda/configuracion
       * Entregas: /admin/pase-batalla/entregas-tienda
       */
    ] satisfies AdminNavGroup[];
  }

  if (normalizedRole === "store") {
    return [
      {
        id: "operations",
        label: "Operación",
        icon: IoTrophyOutline,
        items: [
          { label: "Torneos", href: "/admin/torneos", icon: IoTrophyOutline },
        ],
      },
    ] satisfies AdminNavGroup[];
  }

  if (normalizedRole === "news") {
    return [
      {
        id: "content",
        label: "Contenido",
        icon: IoNewspaperOutline,
        items: [
          { label: "Noticias", href: "/admin/noticias", icon: IoNewspaperOutline },
        ],
      },
    ] satisfies AdminNavGroup[];
  }

  return [] satisfies AdminNavGroup[];
};

export const AdminSidebar = () => {
  const isOpen = useUIStore((state) => state.isTournamentSidebarOpen);
  const close = useUIStore((state) => state.closeTournamentSidebar);
  const isCollapsed = useUIStore((state) => state.isTournamentSidebarCollapsed);
  const toggleCollapsed = useUIStore(
    (state) => state.toggleTournamentSidebarCollapsed,
  );
  const { data: session } = useSession();
  const pathname = usePathname();
  const navigation = useMemo(
    () => getAdminNavigation(session?.user?.role),
    [session?.user?.role],
  );
  const activeGroupId = navigation.find((group) =>
    group.items.some((item) => isPathActive(pathname, item.href)),
  )?.id;
  const [openGroups, setOpenGroups] = useState<string[]>(
    activeGroupId ? [activeGroupId] : [],
  );

  useEffect(() => {
    if (!activeGroupId) return;

    setOpenGroups((current) =>
      current.includes(activeGroupId) ? current : [...current, activeGroupId],
    );
  }, [activeGroupId]);

  const activeItemHref = navigation
    .flatMap((group) => group.items)
    // La pestaña de cosméticos comparte pathname con medios; el módulo
    // general mantiene el estado activo mientras se navega por query string.
    .filter((item) => !item.href.includes("?") && isPathActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const toggleGroup = (groupId: string) => {
    setOpenGroups((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId],
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        id="admin-sidebar"
        className={clsx(
          "fixed top-0 right-0 z-40 flex h-full w-72 flex-col bg-white text-slate-900 shadow-sm transition-[width] duration-200 ease-out dark:bg-tournament-dark-surface dark:text-white lg:static lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 lg:will-change-[width] lg:border-r lg:border-tournament-dark-accent dark:lg:border-tournament-dark-border",
          isCollapsed ? "lg:w-20" : "lg:w-72",
          {
            "translate-x-0": isOpen,
            "translate-x-full": !isOpen,
          },
        )}
      >
        <div
          className={clsx(
            "flex items-center justify-between border-b border-slate-200 p-4 dark:border-tournament-dark-border",
            isCollapsed && "lg:justify-center",
          )}
        >
          <span
            className={clsx(
              "whitespace-nowrap font-bold text-slate-900 dark:text-white",
              isCollapsed && "lg:hidden",
            )}
          >
            Panel de administración
          </span>

          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:inline-flex dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-white"
            aria-label={
              isCollapsed
                ? "Expandir menú de administración"
                : "Contraer menú de administración"
            }
            aria-expanded={!isCollapsed}
            aria-controls="admin-sidebar"
            title={
              isCollapsed
                ? "Expandir menú de administración"
                : "Contraer menú de administración"
            }
          >
            <span className="relative flex h-6 w-6 items-center justify-center">
              <IoMenuSharp
                className={clsx(
                  "absolute h-6 w-6 transition duration-200 ease-in-out",
                  isCollapsed
                    ? "rotate-90 scale-75 opacity-0"
                    : "rotate-0 scale-100 opacity-100",
                )}
                aria-hidden="true"
              />
              <IoCloseOutline
                className={clsx(
                  "absolute h-6 w-6 transition duration-200 ease-in-out",
                  isCollapsed
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-75 opacity-0",
                )}
                aria-hidden="true"
              />
            </span>
          </button>

          <button
            type="button"
            onClick={close}
            className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-tournament-dark-muted lg:hidden"
            aria-label="Cerrar menú de administración"
          >
            <IoCloseOutline size={22} />
          </button>
        </div>

        <nav
          className={clsx(
            "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-4",
            isCollapsed && "lg:px-2",
          )}
        >
          {navigation.map((group) => {
            const isGroupOpen = openGroups.includes(group.id);
            const GroupIcon = group.icon;

            return (
              <section key={group.id}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isGroupOpen}
                  title={isCollapsed ? group.label : undefined}
                  className={clsx(
                    "flex w-full items-center justify-between rounded-lg px-4 py-2 text-left text-xs font-bold uppercase tracking-[0.14em] text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-tournament-dark-muted dark:hover:text-white",
                    isCollapsed && "lg:justify-center lg:px-2",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <GroupIcon size={17} />
                    <span className={clsx("truncate", isCollapsed && "lg:hidden")}>
                      {group.label}
                    </span>
                  </span>
                  <IoChevronDownOutline
                    size={17}
                    className={clsx(
                      "shrink-0 transition-transform",
                      isGroupOpen && "rotate-180",
                      isCollapsed && "lg:hidden",
                    )}
                  />
                </button>

                {isGroupOpen && (
                  <div
                    className={clsx(
                      "mt-1 space-y-1 border-l border-slate-200 pl-2 dark:border-tournament-dark-border",
                      isCollapsed && "lg:border-l-0 lg:pl-0",
                    )}
                  >
                    {group.items.map(({ label, href, icon: Icon }) => {
                      const isActive = activeItemHref === href;

                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={close}
                          title={isCollapsed ? label : undefined}
                          className={clsx(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isCollapsed && "lg:justify-center lg:px-2",
                            isActive
                              ? "bg-purple-600 text-white shadow-sm dark:bg-tournament-dark-accent"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-white",
                          )}
                        >
                          <Icon size={19} />
                          <span
                            className={clsx(
                              "whitespace-nowrap",
                              isCollapsed && "lg:hidden",
                            )}
                          >
                            {label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-3 pb-4 dark:border-tournament-dark-border lg:hidden">
          <button
            type="button"
            onClick={async () => {
              close();
              await signOutOnce();
            }}
            className="mt-3 flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-white"
          >
            <IoLogOutOutline size={22} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};
