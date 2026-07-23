"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReadonlyURLSearchParams } from "next/navigation";
import clsx from "clsx";
import { FiEdit, FiImage, FiPlus, FiSearch, FiUpload } from "react-icons/fi";
import { IoTrashOutline } from "react-icons/io5";
import {
  deleteCardAction,
  getAdminCardsAction,
  type getAdminCardPropertiesAction,
} from "@/actions/cards/admin-cards.action";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { resolveCardImageUrl } from "@/utils/card-image";

type Properties = Awaited<ReturnType<typeof getAdminCardPropertiesAction>>;
type AdminCardListItem = Awaited<
  ReturnType<typeof getAdminCardsAction>
>["cards"][number];

type Props = {
  properties: Properties;
};

type StatusFilter = "active" | "deleted" | "all";
type ImageFilter = "all" | "missing";

const PAGE_SIZE = 20;
const ROTATION_OPTIONS = Array.from({ length: 11 }, (_, index) => index);
const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

export const AdminCardsManager = ({ properties }: Props) => {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );

  const [cards, setCards] = useState<AdminCardListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [productId, setProductId] = useState("");
  const [rarityId, setRarityId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [archetypeId, setArchetypeId] = useState("");
  const [keywordId, setKeywordId] = useState("");
  const [rotation, setRotation] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [image, setImage] = useState<ImageFilter>("all");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedText(text), 300);
    return () => clearTimeout(timeout);
  }, [text]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedText,
    productId,
    rarityId,
    typeId,
    archetypeId,
    keywordId,
    rotation,
    status,
    image,
  ]);

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminCardsAction({
        text: debouncedText || undefined,
        productId: productId || undefined,
        rarityId: rarityId || undefined,
        typeId: typeId || undefined,
        archetypeId: archetypeId || undefined,
        keywordId: keywordId || undefined,
        rotation: rotation ? Number(rotation) : undefined,
        status,
        image,
        page: currentPage,
        take: PAGE_SIZE,
      });
      setCards(result.cards);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las cartas",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [
    archetypeId,
    currentPage,
    debouncedText,
    image,
    keywordId,
    productId,
    rarityId,
    rotation,
    showToast,
    status,
    typeId,
  ]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const handleDelete = (card: AdminCardListItem) => {
    openConfirmation({
      text: "Desactivar carta",
      description: `La carta ${card.code} dejara de aparecer en vistas publicas, pero no se borrara de la base de datos.`,
      action: async () => {
        showLoading("Desactivando carta...");
        try {
          await deleteCardAction({ cardId: card.id });
          return true;
        } finally {
          hideLoading();
        }
      },
      onSuccess: () => {
        showToast("Carta desactivada", "success");
        void loadCards();
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo desactivar la carta", "error");
      },
    });
  };

  const resetFilters = () => {
    setText("");
    setDebouncedText("");
    setProductId("");
    setRarityId("");
    setTypeId("");
    setArchetypeId("");
    setKeywordId("");
    setRotation("");
    setStatus("active");
    setImage("all");
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Administracion de cartas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestiona cartas individuales, imagenes y estado de publicacion.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/cartas/importar-cartas"
            className="inline-flex items-center gap-2 rounded-lg border border-tournament-dark-accent bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
          >
            <FiUpload className="h-4 w-4" />
            Importar cartas
          </Link>
          <Link
            href="/admin/cartas/actualizar-imagenes"
            className="inline-flex items-center gap-2 rounded-lg border border-tournament-dark-accent bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
          >
            <FiImage className="h-4 w-4" />
            Actualizar imagenes
          </Link>
          <Link
            href="/admin/cartas/crear-carta"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700"
          >
            <FiPlus className="h-4 w-4" />
            Crear carta
          </Link>
        </div>
      </header>

      <div className="space-y-4 rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
          <label className="sm:col-span-2 md:col-span-4 lg:col-span-1">
            <span className="hidden text-sm font-semibold text-slate-700 dark:text-slate-200 lg:invisible lg:mb-1 lg:block">
              Busqueda
            </span>
            <span className="relative block">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Buscar por nombre, codigo, numeracion o efecto"
                className="w-full rounded-lg border border-tournament-dark-accent bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
              />
            </span>
          </label>

          <Select value={productId} onChange={setProductId} label="Producto">
            <option value="">Todos los productos</option>
            {properties.products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.code} - {product.name}
              </option>
            ))}
          </Select>

          <Select value={rarityId} onChange={setRarityId} label="Rareza">
            <option value="">Todas las rarezas</option>
            {properties.rarities.map((rarity) => (
              <option key={rarity.id} value={rarity.id}>
                {rarity.name}
              </option>
            ))}
          </Select>

          <Select value={typeId} onChange={setTypeId} label="Tipo">
            <option value="">Todos los tipos</option>
            {properties.types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>

          <Select
            value={status}
            onChange={(value) => setStatus(value as StatusFilter)}
            label="Estado"
          >
            <option value="active">Activas</option>
            <option value="deleted">Desactivadas</option>
            <option value="all">Todas</option>
          </Select>

          <Select
            value={archetypeId}
            onChange={setArchetypeId}
            label="Arquetipo"
          >
            <option value="">Todos los arquetipos</option>
            {properties.archetypes.map((archetype) => (
              <option key={archetype.id} value={archetype.id}>
                {archetype.name}
              </option>
            ))}
          </Select>

          <Select value={keywordId} onChange={setKeywordId} label="Keyword">
            <option value="">Todas las keywords</option>
            {properties.keywords.map((keyword) => (
              <option key={keyword.id} value={keyword.id}>
                {keyword.name}
              </option>
            ))}
          </Select>

          <Select value={rotation} onChange={setRotation} label="Rotacion">
            <option value="">Todas</option>
            {ROTATION_OPTIONS.map((item) => (
              <option key={item} value={String(item)}>
                {item}
              </option>
            ))}
          </Select>

          <Select
            value={image}
            onChange={(value) => setImage(value as ImageFilter)}
            label="Imagen"
          >
            <option value="all">Todas</option>
            <option value="missing">Sin imagen</option>
          </Select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>
            {loading ? "Cargando..." : `${totalCount} cartas encontradas`}
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-tournament-dark-accent px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-tournament-dark-accent bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-tournament-dark-border/60 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Carta</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Rareza</th>
                <th className="px-4 py-3">Coste</th>
                <th className="px-4 py-3">Rotación</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => {
                const imageSrc = resolveCardImageUrl({
                  imageUrl: card.imageUrl,
                  code: card.code,
                  idd: card.idd,
                });
                return (
                  <tr
                    key={card.id}
                    className="border-b border-tournament-dark-border/40 text-slate-700 last:border-b-0 dark:text-slate-200"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-12 overflow-hidden rounded border border-tournament-dark-accent bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={card.name}
                              width={96}
                              height={132}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                              Sin img
                            </span>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/cartas/${card.id}`}
                            className="font-semibold text-slate-900 underline-offset-4 transition hover:text-purple-600 hover:underline dark:text-white dark:hover:text-purple-300"
                          >
                            {card.name}
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {card.idd}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{card.code}</td>
                    <td className="px-4 py-3 text-xs">{card.product.code}</td>
                    <td className="px-4 py-3 text-xs">
                      {card.rarities.map((rarity) => rarity.name).join(", ") ||
                        "-"}
                    </td>
                    <td className="px-4 py-3 text-xs">{card.cost}</td>
                    <td className="px-4 py-3 text-xs">{card.rotation}</td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={clsx(
                          "inline-flex rounded-full px-2 py-1 font-semibold ring-1 ring-inset",
                          card.status === "deleted"
                            ? "bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-500/30"
                            : "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-500/30",
                        )}
                      >
                        {card.status === "deleted" ? "Desactivada" : "Activa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          title="Editar"
                          onClick={() =>
                            router.push(`/admin/cartas/${card.id}`)
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-tournament-dark-accent text-slate-600 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Desactivar"
                          disabled={card.status === "deleted"}
                          onClick={() => handleDelete(card)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && cards.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No hay cartas para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationLine
        totalPages={totalPages}
        currentPage={currentPage}
        pathname="/admin/cartas"
        searchParams={EMPTY_SEARCH_PARAMS}
        onPageChange={setCurrentPage}
      />
    </section>
  );
};

const Select = ({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) => (
  <label className="flex min-w-0 flex-col">
    <span className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-w-0 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
    >
      {children}
    </select>
  </label>
);
