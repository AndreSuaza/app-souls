"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { IoFlashOutline, IoMedalOutline } from "react-icons/io5";
import {
  purchaseCosmeticAction,
  type CosmeticStoreData,
  type CosmeticStoreItem,
} from "@/actions";
import { resolveAvatarRarityLabel } from "@/models/avatar.models";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { toBlobUrl } from "@/utils/blob-path";

type Props = {
  initialData: CosmeticStoreData;
  onPurchase: (item: CosmeticStoreItem, victoryPoints: number) => void;
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
}> = [
  { value: "ALL", label: "Todos" },
  { value: "AVATAR", label: "Avatares" },
  { value: "BANNER", label: "Banners" },
  { value: "FRAME", label: "Marcos" },
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
    "border-slate-400/40 bg-slate-500/20 text-slate-100 dark:border-slate-500/50 dark:bg-slate-500/20 dark:text-slate-200",
  RARE: "border-cyan-400/40 bg-cyan-500/20 text-cyan-100",
  ULTRA: "border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-100",
  SECRET: "border-amber-400/40 bg-amber-500/20 text-amber-100",
  ASCENDED: "border-rose-400/40 bg-rose-500/20 text-rose-100",
};

const formatPv = (value: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value);

const isPurchaseBlockedByRarity = (rarity: string) => rarity === "ASCENDED";

export const CosmeticStoreView = ({ initialData, onPurchase }: Props) => {
  const [selectedType, setSelectedType] = useState<CosmeticTypeFilter>("ALL");
  const [selectedRarity, setSelectedRarity] =
    useState<CosmeticRarityFilter>("ALL");
  const [selectedSort, setSelectedSort] = useState<CosmeticSort>("FEATURED");
  const { items, victoryPoints } = initialData;

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
      showToast("Ya tienes este cosmetico desbloqueado.", "info");
      return;
    }

    if (isPurchaseBlockedByRarity(item.rarity)) {
      showToast(
        "Este cosmetico se obtiene por logro exclusivo y no se vende en tienda.",
        "info",
      );
      return;
    }

    if (victoryPoints < item.price) {
      showToast(
        "No tienes suficientes PV para comprar este cosmetico.",
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
          onPurchase(item, response.victoryPoints);
          showToast("Cosmetico comprado correctamente.", "success");
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
    <section className="space-y-6 text-slate-900 dark:text-white">
      <section className="rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-xl font-semibold text-purple-800 sm:text-2xl dark:text-purple-100">
            <IoFlashOutline className="h-6 w-6 text-purple-500 dark:text-purple-300" />
            Destacados
          </h3>
          <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-700 dark:border-rose-300/30 dark:bg-rose-500/10 dark:text-rose-100">
            Temporada {initialData.currentSeasonNumber}
          </span>
        </div>

        {featuredItems.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {featuredItems.map((item, index) => (
              <article
                key={item.id}
                className={`relative overflow-hidden rounded-2xl border bg-slate-950 ${
                  index === 0
                    ? "border-purple-300 shadow-[0_0_30px_rgba(147,51,234,0.22)] dark:border-purple-500/70"
                    : "border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.18)] dark:border-amber-500/60"
                }`}
              >
                <Image
                  src={toBlobUrl(item.imageUrl)}
                  alt={item.name}
                  width={1200}
                  height={640}
                  unoptimized
                  className="h-[280px] w-full object-cover sm:h-[320px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-100">
                    <IoMedalOutline className="h-4 w-4" />
                    {resolveAvatarRarityLabel(item.rarity)}
                  </div>
                  <h4 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                    {item.name}
                  </h4>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="rounded-xl border border-white/20 bg-slate-950/80 px-4 py-2 text-lg font-bold text-amber-200 backdrop-blur">
                      {formatPv(item.price)} PV
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePurchase(item)}
                      disabled={
                        item.owned || isPurchaseBlockedByRarity(item.rarity)
                      }
                      className={`rounded-xl px-5 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                        item.owned
                          ? "cursor-default border border-white/20 bg-white/10 text-slate-300"
                          : isPurchaseBlockedByRarity(item.rarity)
                            ? "cursor-not-allowed border border-rose-300/20 bg-rose-500/10 text-rose-100/70"
                            : "bg-purple-200 text-purple-950 hover:bg-purple-100"
                      }`}
                      title={
                        item.owned
                          ? "Cosmetico ya desbloqueado"
                          : "Comprar cosmetico"
                      }
                    >
                      {item.owned ? "Obtenido" : "Comprar"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300">
            No hay cosméticos destacados disponibles.
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70 sm:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Catalogo
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedType}
              onChange={(event) =>
                setSelectedType(event.target.value as CosmeticTypeFilter)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-bg dark:text-white"
              title="Filtrar por tipo"
            >
              {typeFilterOptions.map((option) => (
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
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-bg dark:text-white"
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
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-bg dark:text-white"
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

        {catalogItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {catalogItems.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition hover:border-purple-300 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:hover:border-purple-500/60"
              >
                <div className="relative bg-slate-950">
                  <Image
                    src={toBlobUrl(item.imageUrl)}
                    alt={item.name}
                    width={640}
                    height={640}
                    unoptimized
                    className={`h-64 w-full object-cover ${item.owned ? "opacity-80" : ""}`}
                  />
                  <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        rarityBadgeClass[item.rarity] ??
                        "border-slate-400/30 bg-slate-500/20 text-slate-200"
                      }`}
                    >
                      {resolveAvatarRarityLabel(item.rarity)}
                    </span>
                    {item.isSeasonal && (
                      <span className="rounded-md border border-rose-300/40 bg-rose-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-100">
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
                    <h4 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900 dark:text-slate-100">
                      {item.name}
                    </h4>
                    <span className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold uppercase text-slate-500 dark:border-white/15 dark:bg-white/5 dark:text-slate-300">
                      {item.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-tournament-dark-border dark:bg-tournament-dark-bg">
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-200">
                      {formatPv(item.price)} PV
                    </p>
                    {initialData.isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => handlePurchase(item)}
                        disabled={
                          item.owned || isPurchaseBlockedByRarity(item.rarity)
                        }
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                          item.owned
                            ? "cursor-default border border-slate-200 bg-slate-100 text-slate-500 dark:border-white/20 dark:bg-white/10 dark:text-slate-300"
                            : isPurchaseBlockedByRarity(item.rarity)
                              ? "cursor-not-allowed border border-rose-300/30 bg-rose-500/10 text-rose-500/70 dark:text-rose-100/70"
                              : "border border-purple-300 bg-purple-100 text-purple-800 hover:bg-purple-200 dark:border-purple-500/60 dark:bg-purple-500/15 dark:text-purple-100 dark:hover:bg-purple-500/30"
                        }`}
                        title={
                          item.owned
                            ? "Cosmetico ya desbloqueado"
                            : "Comprar cosmetico"
                        }
                      >
                        {item.owned ? "Obtenido" : "Comprar"}
                      </button>
                    ) : (
                      <Link
                        href="/auth/login"
                        title="Iniciar sesion"
                        className="rounded-lg border border-purple-300 bg-purple-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-purple-800 transition hover:bg-purple-200 dark:border-purple-500/60 dark:bg-purple-500/15 dark:text-purple-100 dark:hover:bg-purple-500/30"
                      >
                        Iniciar sesion
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300">
            No hay cosméticos para los filtros seleccionados.
          </div>
        )}
      </section>
    </section>
  );
};
