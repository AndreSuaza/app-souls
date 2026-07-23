"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ReadonlyURLSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  IoImageOutline,
  IoImagesOutline,
  IoPersonCircleOutline,
  IoReceiptOutline,
  IoSearchOutline,
  IoSettingsOutline,
  IoStorefrontOutline,
} from "react-icons/io5";
import {
  getAdminStoreSalesAction,
  type AdminStoreSaleLog,
  type AdminStoreSalesResult,
} from "@/actions";
import { ProfileMediaManager } from "@/components/media/admin/ProfileMediaManager";
import { PaginationLine } from "@/components/ui";
import { toAssetStorageUrl } from "@/utils/asset-path";

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

const SALES_PAGE_SIZE = 10;
const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

const EMPTY_SALES_RESULT: AdminStoreSalesResult = {
  items: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  perPage: SALES_PAGE_SIZE,
  seasonOptions: [],
};

type StoreSection = "cosmetics" | "sales" | "settings";
type CosmeticTab = (typeof cosmeticTabs)[number]["id"];
type SalesTypeFilter = "ALL" | "AVATAR" | "BANNER" | "FRAME";
type SalesRarityFilter =
  | "ALL"
  | "COMMON"
  | "RARE"
  | "ULTRA"
  | "SECRET"
  | "ASCENDED";
type SalesOrderFilter = "recent" | "oldest" | "price-desc" | "price-asc";

type Props = {
  section?: StoreSection;
};

const typeLabels: Record<string, string> = {
  AVATAR: "Avatar",
  BANNER: "Banner",
  FRAME: "Marco",
};

const rarityLabels: Record<string, string> = {
  COMMON: "Comun",
  RARE: "Raro",
  ULTRA: "Ultra",
  SECRET: "Secreta",
  ASCENDED: "Ascendida",
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const renderSaleRows = (sales: AdminStoreSaleLog[]) =>
  sales.map((sale) => (
    <tr
      key={sale.id}
      className="text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-tournament-dark-muted/60"
    >
      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
        {formatDate(sale.createdAt)}
      </td>
      <td className="px-4 py-3">
        <div className="font-semibold">
          {sale.user.nickname || sale.user.email || "-"}
        </div>
        <div className="text-xs text-slate-400">
          {sale.user.name || sale.user.lastname
            ? `${sale.user.name ?? ""} ${sale.user.lastname ?? ""}`.trim()
            : sale.user.id}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex min-w-52 items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-tournament-dark-muted">
            <Image
              src={toAssetStorageUrl(sale.cosmetic.imageUrl)}
              alt={sale.cosmetic.name}
              width={80}
              height={80}
              className="h-full w-full object-contain"
            />
          </div>
          <span className="font-semibold">{sale.cosmetic.name}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {typeLabels[sale.cosmetic.type] ?? sale.cosmetic.type}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        {rarityLabels[sale.cosmetic.rarity] ?? sale.cosmetic.rarity}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-amber-500">
        {sale.pricePaid} PV
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        {sale.seasonNumber ?? "-"}
      </td>
    </tr>
  ));

export const AdminStoreManager = ({ section = "cosmetics" }: Props) => {
  const activeMainTab = section;
  const [activeCosmeticTab, setActiveCosmeticTab] =
    useState<CosmeticTab>("avatars");
  const [salesData, setSalesData] =
    useState<AdminStoreSalesResult>(EMPTY_SALES_RESULT);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [salesPage, setSalesPage] = useState(1);
  const [salesSearchInput, setSalesSearchInput] = useState("");
  const [salesSearch, setSalesSearch] = useState("");
  const [salesTypeFilter, setSalesTypeFilter] =
    useState<SalesTypeFilter>("ALL");
  const [salesRarityFilter, setSalesRarityFilter] =
    useState<SalesRarityFilter>("ALL");
  const [salesSeasonFilter, setSalesSeasonFilter] = useState("ALL");
  const [salesOrderFilter, setSalesOrderFilter] =
    useState<SalesOrderFilter>("recent");

  const activeCosmetic =
    cosmeticTabs.find((tab) => tab.id === activeCosmeticTab) ?? cosmeticTabs[0];

  const hasSalesFilters =
    salesSearchInput.trim().length > 0 ||
    salesTypeFilter !== "ALL" ||
    salesRarityFilter !== "ALL" ||
    salesSeasonFilter !== "ALL" ||
    salesOrderFilter !== "recent";

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSalesPage(1);
      setSalesSearch(salesSearchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [salesSearchInput]);

  useEffect(() => {
    if (activeMainTab !== "sales") return;

    let active = true;

    const loadSales = async () => {
      try {
        setSalesLoading(true);
        setSalesError(null);
        const result = await getAdminStoreSalesAction({
          page: salesPage,
          perPage: SALES_PAGE_SIZE,
          query: salesSearch,
          type: salesTypeFilter,
          rarity: salesRarityFilter,
          season: salesSeasonFilter,
          order: salesOrderFilter,
        });

        if (active) {
          setSalesData(result);
          if (result.currentPage !== salesPage) {
            setSalesPage(result.currentPage);
          }
        }
      } catch (error) {
        if (active) {
          setSalesData(EMPTY_SALES_RESULT);
          setSalesError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las ventas de la tienda.",
          );
        }
      } finally {
        if (active) {
          setSalesLoading(false);
        }
      }
    };

    loadSales();

    return () => {
      active = false;
    };
  }, [
    activeMainTab,
    salesOrderFilter,
    salesPage,
    salesRarityFilter,
    salesSearch,
    salesSeasonFilter,
    salesTypeFilter,
  ]);

  const resetSalesFilters = () => {
    setSalesSearchInput("");
    setSalesSearch("");
    setSalesTypeFilter("ALL");
    setSalesRarityFilter("ALL");
    setSalesSeasonFilter("ALL");
    setSalesOrderFilter("recent");
    setSalesPage(1);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Administracion de tienda
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Centraliza cosméticos, historial de ventas y configuracion operativa
            de la tienda.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/tienda"
            className="inline-flex items-center gap-2 rounded-lg border border-tournament-dark-accent bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
          >
            <IoStorefrontOutline className="h-4 w-4" />
            Cosméticos
          </Link>
          <Link
            href="/admin/tienda/ventas"
            className="inline-flex items-center gap-2 rounded-lg border border-tournament-dark-accent bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
          >
            <IoReceiptOutline className="h-4 w-4" />
            Ventas
          </Link>
          <Link
            href="/admin/tienda/configuracion"
            className="inline-flex items-center gap-2 rounded-lg border border-tournament-dark-accent bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
          >
            <IoSettingsOutline className="h-4 w-4" />
            Configuracion
          </Link>
        </div>
      </header>

      <section className="space-y-5 rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        {activeMainTab === "cosmetics" && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {cosmeticTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeCosmeticTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCosmeticTab(tab.id)}
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
                      isActive
                        ? "border-purple-500 bg-purple-100 text-purple-700 dark:bg-purple-600/20 dark:text-purple-200"
                        : "border-tournament-dark-accent bg-white text-slate-600 hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <ProfileMediaManager
              section={activeCosmetic.section}
              type={activeCosmetic.type}
            />
          </div>
        )}

        {activeMainTab === "sales" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                  <IoReceiptOutline size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Registro de ventas
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Historial paginado de compras registradas en la tienda.
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {salesData.totalCount} registros
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.8fr_1fr_1fr_1fr_1fr_auto]">
              <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Buscar
                <div className="relative">
                  <IoSearchOutline className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={salesSearchInput}
                    onChange={(event) =>
                      setSalesSearchInput(event.target.value)
                    }
                    placeholder="Usuario o cosmetico"
                    className="w-full rounded-lg border border-tournament-dark-accent bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
                  />
                </div>
              </label>

              <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Tipo
                <select
                  value={salesTypeFilter}
                  onChange={(event) => {
                    setSalesPage(1);
                    setSalesTypeFilter(event.target.value as SalesTypeFilter);
                  }}
                  className="rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
                >
                  <option value="ALL">Todos</option>
                  <option value="AVATAR">Avatar</option>
                  <option value="BANNER">Banner</option>
                  <option value="FRAME">Marco</option>
                </select>
              </label>

              <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Rareza
                <select
                  value={salesRarityFilter}
                  onChange={(event) => {
                    setSalesPage(1);
                    setSalesRarityFilter(
                      event.target.value as SalesRarityFilter,
                    );
                  }}
                  className="rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
                >
                  <option value="ALL">Todas</option>
                  <option value="COMMON">Comun</option>
                  <option value="RARE">Raro</option>
                  <option value="ULTRA">Ultra</option>
                  <option value="SECRET">Secreta</option>
                  <option value="ASCENDED">Ascendida</option>
                </select>
              </label>

              <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Temporada
                <select
                  value={salesSeasonFilter}
                  onChange={(event) => {
                    setSalesPage(1);
                    setSalesSeasonFilter(event.target.value);
                  }}
                  className="rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
                >
                  <option value="ALL">Todas</option>
                  <option value="PERMANENT">Permanentes</option>
                  {salesData.seasonOptions.map((season) => (
                    <option key={season} value={season.toString()}>
                      Temporada {season}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Orden
                <select
                  value={salesOrderFilter}
                  onChange={(event) => {
                    setSalesPage(1);
                    setSalesOrderFilter(event.target.value as SalesOrderFilter);
                  }}
                  className="rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
                >
                  <option value="recent">Mas recientes</option>
                  <option value="oldest">Mas antiguas</option>
                  <option value="price-desc">Mayor precio</option>
                  <option value="price-asc">Menor precio</option>
                </select>
              </label>

              <button
                type="button"
                onClick={resetSalesFilters}
                disabled={!hasSalesFilters}
                className="self-end rounded-lg border border-tournament-dark-accent px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-purple-400 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:text-purple-200"
              >
                Borrar filtros
              </button>
            </div>

            {salesError && !salesLoading && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
                {salesError}
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-tournament-dark-accent dark:border-tournament-dark-border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-tournament-dark-border">
                  <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-tournament-dark-muted dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">Usuario</th>
                      <th className="px-4 py-3 font-semibold">Cosmetico</th>
                      <th className="px-4 py-3 font-semibold">Tipo</th>
                      <th className="px-4 py-3 font-semibold">Rareza</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Temporada
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white dark:divide-tournament-dark-border dark:bg-tournament-dark-surface">
                    {salesLoading && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
                        >
                          Cargando ventas...
                        </td>
                      </tr>
                    )}

                    {!salesLoading && salesData.items.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
                        >
                          No hay ventas para los filtros seleccionados.
                        </td>
                      </tr>
                    )}

                    {!salesLoading && renderSaleRows(salesData.items)}
                  </tbody>
                </table>
              </div>
            </div>

            <PaginationLine
              totalPages={salesData.totalPages}
              currentPage={salesData.currentPage}
              pathname="/admin/tienda/ventas"
              searchParams={EMPTY_SEARCH_PARAMS}
              onPageChange={setSalesPage}
            />
          </div>
        )}

        {activeMainTab === "settings" && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                <IoSettingsOutline size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Configuracion de tienda
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Base preparada para reglas globales de temporada y rotacion.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Temporada activa",
                  text: "Controlar numero de temporada, fechas y visibilidad global.",
                },
                {
                  title: "Reglas de precios",
                  text: "Definir rangos recomendados por rareza y tipo de cosmetico.",
                },
                {
                  title: "Rotacion y destacados",
                  text: "Gestionar orden de destacados y disponibilidad de temporada.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-dashed border-tournament-dark-accent bg-slate-50 p-5 dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong"
                >
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
