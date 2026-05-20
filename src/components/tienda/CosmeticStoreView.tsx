"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  IoFlagOutline,
  IoFlashOutline,
  IoGridOutline,
  IoImageOutline,
  IoMedalOutline,
  IoPersonCircleOutline,
  IoStorefrontOutline,
} from "react-icons/io5";
import {
  purchaseCosmeticAction,
  type CosmeticStoreData,
  type CosmeticStoreItem,
} from "@/actions";
import { toBlobUrl } from "@/utils/blob-path";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { resolveAvatarRarityLabel } from "@/models/avatar.models";

type Props = {
  initialData: CosmeticStoreData;
};

type CosmeticTypeFilter = "ALL" | "AVATAR" | "BANNER" | "FRAME";
type CosmeticRarityFilter =
  | "ALL"
  | "COMMON"
  | "RARE"
  | "ULTRA"
  | "SECRET"
  | "ASCENDED";
type CosmeticSort = "PRICE_ASC" | "PRICE_DESC" | "NEWEST" | "FEATURED";

const typeFilterOptions: Array<{
  value: CosmeticTypeFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "ALL", label: "Todos", icon: IoGridOutline },
  { value: "AVATAR", label: "Avatares", icon: IoPersonCircleOutline },
  { value: "BANNER", label: "Banners", icon: IoFlagOutline },
  { value: "FRAME", label: "Marcos", icon: IoImageOutline },
];

const rarityFilterOptions: Array<{
  value: CosmeticRarityFilter;
  label: string;
}> = [
  { value: "ALL", label: "Todas las rarezas" },
  { value: "COMMON", label: "Comun" },
  { value: "RARE", label: "Raro" },
  { value: "ULTRA", label: "Ultra" },
  { value: "SECRET", label: "Secreta" },
  { value: "ASCENDED", label: "Ascendida" },
];

const sortOptions: Array<{ value: CosmeticSort; label: string }> = [
  { value: "FEATURED", label: "Destacados" },
  { value: "PRICE_ASC", label: "Precio menor a mayor" },
  { value: "PRICE_DESC", label: "Precio mayor a menor" },
  { value: "NEWEST", label: "Mas recientes" },
];

const rarityOrder: Record<string, number> = {
  COMMON: 1,
  RARE: 2,
  ULTRA: 3,
  SECRET: 4,
  ASCENDED: 5,
};

const rarityBadgeClass: Record<string, string> = {
  COMMON:
    "border-slate-400/40 bg-slate-500/20 text-slate-200 dark:border-slate-500/50 dark:bg-slate-500/20 dark:text-slate-200",
  RARE: "border-cyan-400/40 bg-cyan-500/20 text-cyan-200",
  ULTRA: "border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-200",
  SECRET: "border-amber-400/40 bg-amber-500/20 text-amber-200",
  ASCENDED: "border-rose-400/40 bg-rose-500/20 text-rose-200",
};

const storeSectionTypeOptions = typeFilterOptions;

const formatPv = (value: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value);

const isPurchaseBlockedByRarity = (rarity: string) => rarity === "ASCENDED";

export const CosmeticStoreView = ({ initialData }: Props) => {
  const [items, setItems] = useState(initialData.items);
  const [victoryPoints, setVictoryPoints] = useState(initialData.victoryPoints);
  const [selectedType, setSelectedType] = useState<CosmeticTypeFilter>("ALL");
  const [selectedRarity, setSelectedRarity] =
    useState<CosmeticRarityFilter>("ALL");
  const [selectedSort, setSelectedSort] = useState<CosmeticSort>("FEATURED");

  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const showToast = useToastStore((state) => state.showToast);
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );

  const featuredItems = useMemo(() => {
    const source = items.filter((item) => item.featured);
    if (source.length >= 2) return source.slice(0, 2);
    return [...source, ...items.filter((item) => !item.featured)].slice(0, 2);
  }, [items]);

  const catalogItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (selectedType !== "ALL" && item.type !== selectedType) return false;
      if (selectedRarity !== "ALL" && item.rarity !== selectedRarity)
        return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (selectedSort === "PRICE_ASC") return a.price - b.price;
      if (selectedSort === "PRICE_DESC") return b.price - a.price;
      if (selectedSort === "NEWEST") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      const rarityDiff =
        (rarityOrder[b.rarity] ?? 0) - (rarityOrder[a.rarity] ?? 0);
      if (rarityDiff !== 0) return rarityDiff;
      return a.price - b.price;
    });
  }, [items, selectedRarity, selectedSort, selectedType]);

  const handlePurchase = (item: CosmeticStoreItem) => {
    if (!initialData.isAuthenticated) {
      showToast("Debes iniciar sesion para comprar cosméticos.", "info");
      return;
    }

    if (item.owned) {
      showToast("Ya tienes este cosmético desbloqueado.", "info");
      return;
    }

    if (isPurchaseBlockedByRarity(item.rarity)) {
      showToast(
        "Este cosmético se obtiene por logro exclusivo y no se vende en tienda.",
        "info",
      );
      return;
    }

    if (victoryPoints < item.price) {
      showToast(
        "No tienes suficientes PV para comprar este cosmético.",
        "error",
      );
      return;
    }

    openConfirmation({
      text: "Confirmar compra",
      description: `Se descontaran ${formatPv(item.price)} PV para desbloquear "${item.name}".`,
      action: async () => {
        try {
          showLoading("Procesando compra...");
          const response = await purchaseCosmeticAction({
            cosmeticId: item.id,
          });
          setVictoryPoints(response.victoryPoints);
          setItems((prev) =>
            prev.map((entry) =>
              entry.id === response.cosmeticId
                ? {
                    ...entry,
                    owned: true,
                  }
                : entry,
            ),
          );
          showToast("Cosmético comprado correctamente.", "success");
          return true;
        } catch (error) {
          showToast(
            error instanceof Error
              ? error.message
              : "No se pudo completar la compra.",
            "error",
          );
          return false;
        } finally {
          hideLoading();
        }
      },
      onError: () => {
        hideLoading();
      },
    });
  };

  return (
    <section className="bg-[#0e0e11] text-white">
      <div className="mx-auto flex min-h-[calc(100vh-72px)] w-full">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#18191f] lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <h1 className="text-3xl font-bold uppercase tracking-[0.24em] text-[#c5a9ff]">
              Armory
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Souls Collector
            </p>
          </div>

          <div className="space-y-2 px-3 py-4">
            {typeFilterOptions.map((option) => {
              const Icon = option.icon;
              const active = selectedType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedType(option.value)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide transition ${
                    active
                      ? "border border-[#7384ac] bg-[#24304a] text-[#d8e6ff]"
                      : "border border-transparent text-slate-300 hover:border-white/15 hover:bg-white/5"
                  }`}
                  title={`Filtrar por ${option.label}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto space-y-3 border-t border-white/10 px-4 py-4">
            <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-200/80">
                Saldo actual
              </p>
              <p className="mt-1 text-xl font-bold text-amber-200">
                {formatPv(victoryPoints)} PV
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
              Temporada activa: {initialData.currentSeasonNumber}
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 lg:hidden">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-[0.16em] text-[#c5a9ff]">
                Armory
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Souls Collector
              </p>
            </div>
            <div className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-200">
              {formatPv(victoryPoints)} PV
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-[#2c2f39] bg-[#14151d] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-[#d9ccff] sm:text-3xl">
                <IoFlashOutline className="h-6 w-6 text-[#a8bfff]" />
                Featured Artifacts
              </h2>
              <span className="rounded-full border border-red-300/30 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-200">
                Temporada {initialData.currentSeasonNumber}
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {featuredItems.map((item, index) => (
                <article
                  key={item.id}
                  className={`relative overflow-hidden rounded-xl border ${
                    index === 0
                      ? "border-[#7a63c7]/80 shadow-[0_0_30px_rgba(122,99,199,0.35)]"
                      : "border-[#b8860b]/60 shadow-[0_0_30px_rgba(184,134,11,0.25)]"
                  }`}
                >
                  <Image
                    src={toBlobUrl(item.imageUrl)}
                    alt={item.name}
                    width={1200}
                    height={640}
                    unoptimized
                    className="h-[320px] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090a0e] via-[#090a0e]/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-wide text-slate-200">
                      <IoMedalOutline className="h-4 w-4" />
                      {resolveAvatarRarityLabel(item.rarity)}
                    </div>
                    <h3 className="text-3xl font-bold leading-tight text-white">
                      {item.name}
                    </h3>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="rounded-lg border border-white/20 bg-[#171922] px-4 py-2 text-xl font-bold text-amber-200">
                        {formatPv(item.price)} PV
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePurchase(item)}
                        disabled={
                          item.owned || isPurchaseBlockedByRarity(item.rarity)
                        }
                        className={`rounded-lg px-6 py-2 text-base font-semibold uppercase tracking-wide transition ${
                          item.owned
                            ? "cursor-default border border-white/20 bg-white/10 text-slate-300"
                            : isPurchaseBlockedByRarity(item.rarity)
                              ? "cursor-not-allowed border border-rose-300/20 bg-rose-500/10 text-rose-200/70"
                              : "bg-[#c8adff] text-[#2c185f] hover:bg-[#d5c2ff]"
                        }`}
                        title={
                          item.owned
                            ? "Cosmético ya desbloqueado"
                            : "Comprar cosmético"
                        }
                      >
                        {item.owned ? "Obtenido" : "Comprar"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-semibold text-white">Vault Catalog</h2>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedType}
                onChange={(event) =>
                  setSelectedType(event.target.value as CosmeticTypeFilter)
                }
                className="rounded-lg border border-white/15 bg-[#1b1d26] px-3 py-2 text-sm text-white outline-none focus:border-[#9e7fff]"
                title="Filtrar por tipo"
              >
                {storeSectionTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedRarity}
                onChange={(event) =>
                  setSelectedRarity(event.target.value as CosmeticRarityFilter)
                }
                className="rounded-lg border border-white/15 bg-[#1b1d26] px-3 py-2 text-sm text-white outline-none focus:border-[#9e7fff]"
                title="Filtrar por rareza"
              >
                {rarityFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedSort}
                onChange={(event) =>
                  setSelectedSort(event.target.value as CosmeticSort)
                }
                className="rounded-lg border border-white/15 bg-[#1b1d26] px-3 py-2 text-sm text-white outline-none focus:border-[#9e7fff]"
                title="Ordenar catalogo"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {catalogItems.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#171922] shadow-sm"
              >
                <div className="relative">
                  <Image
                    src={toBlobUrl(item.imageUrl)}
                    alt={item.name}
                    width={640}
                    height={640}
                    unoptimized
                    className={`h-64 w-full object-cover ${item.owned ? "opacity-80" : ""}`}
                  />
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        rarityBadgeClass[item.rarity] ??
                        "border-slate-400/30 bg-slate-500/20 text-slate-200"
                      }`}
                    >
                      {resolveAvatarRarityLabel(item.rarity)}
                    </span>
                    {item.isSeasonal && (
                      <span className="rounded-md border border-red-300/40 bg-red-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-100">
                        T{item.seasonNumber ?? initialData.currentSeasonNumber}
                      </span>
                    )}
                  </div>
                  {item.owned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                      <span className="rounded-md border border-white/30 bg-black/50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
                        Obtenido
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-slate-100">
                      {item.name}
                    </h3>
                    <span className="rounded border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-semibold uppercase text-slate-300">
                      {item.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-[#101218] px-3 py-2">
                    <p className="text-xl font-bold text-amber-200">
                      {formatPv(item.price)} PV
                    </p>
                    {initialData.isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => handlePurchase(item)}
                        disabled={
                          item.owned || isPurchaseBlockedByRarity(item.rarity)
                        }
                        className={`rounded-md px-4 py-1.5 text-sm font-semibold uppercase tracking-wide transition ${
                          item.owned
                            ? "cursor-default border border-white/20 bg-white/10 text-slate-300"
                            : isPurchaseBlockedByRarity(item.rarity)
                              ? "cursor-not-allowed border border-rose-300/20 bg-rose-500/10 text-rose-200/70"
                              : "border border-[#9e7fff] bg-[#9e7fff]/15 text-[#d7c7ff] hover:bg-[#9e7fff]/30"
                        }`}
                        title={
                          item.owned
                            ? "Cosmético ya desbloqueado"
                            : "Comprar cosmético"
                        }
                      >
                        {item.owned ? "Obtenido" : "Comprar"}
                      </button>
                    ) : (
                      <Link
                        href="/auth/login"
                        title="Iniciar sesion"
                        className="rounded-md border border-[#9e7fff] bg-[#9e7fff]/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#d7c7ff] transition hover:bg-[#9e7fff]/30"
                      >
                        Iniciar sesion
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {catalogItems.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-white/20 bg-[#12141b] p-8 text-center text-slate-400">
              No hay cosméticos para los filtros seleccionados.
            </div>
          )}

          <button
            type="button"
            title="Historial de compras (proximamente)"
            className="fixed bottom-6 right-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#b99bff] bg-[#b99bff] text-[#281754] shadow-[0_12px_30px_rgba(185,155,255,0.35)] transition hover:scale-105"
          >
            <IoStorefrontOutline className="h-7 w-7" />
          </button>
        </main>
      </div>
    </section>
  );
};
