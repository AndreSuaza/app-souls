"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IoTrashOutline } from "react-icons/io5";
import clsx from "clsx";
import { deleteProductAction } from "@/actions";
import { PaginationLine } from "@/components/ui";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import type { AdminProductListItem } from "@/interfaces";
import { AdminProductsSearch } from "./AdminProductsSearch";

type Props = {
  products: AdminProductListItem[];
  onDeleted?: (id: string) => void;
};

type OrderFilter = "recent" | "old";
type VisibilityFilter = "all" | "visible" | "hidden";

const PAGE_SIZE = 10;

const resolveProductImage = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith("http")) return value;
  return `/products/${value}.webp`;
};

export const AdminProductsList = ({ products, onDeleted }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const prevQueryRef = useRef(query);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("recent");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");
  const filtersRef = useRef({
    order: orderFilter,
    visibility: visibilityFilter,
  });

  const pageParam = Number(searchParams.get("page") ?? 1);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = products.filter((product) => {
      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        product.code.toLowerCase().includes(term) ||
        product.releaseDate.toLowerCase().includes(term)
      );
    });

    const visibilityFiltered = list.filter((product) => {
      if (visibilityFilter === "all") return true;
      return visibilityFilter === "visible" ? product.show : !product.show;
    });

    // El índice define el orden real, por eso lo usamos como criterio de "reciente".
    const sorted = [...visibilityFiltered].sort((a, b) =>
      orderFilter === "recent" ? b.index - a.index : a.index - b.index,
    );

    return sorted;
  }, [products, query, orderFilter, visibilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setQuery(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  useEffect(() => {
    if (prevQueryRef.current === query) return;
    prevQueryRef.current = query;

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [query, pathname, router, searchParams]);

  useEffect(() => {
    if (
      filtersRef.current.order === orderFilter &&
      filtersRef.current.visibility === visibilityFilter
    ) {
      return;
    }
    filtersRef.current = {
      order: orderFilter,
      visibility: visibilityFilter,
    };

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [orderFilter, visibilityFilter, pathname, router, searchParams]);

  useEffect(() => {
    if (currentPage > totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set("page", totalPages.toString());
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [currentPage, totalPages, pathname, router, searchParams]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleDelete = (id: string) => {
    openConfirmation({
      text: "¿Deseas eliminar este producto?",
      description: "Esta acción no se puede deshacer.",
      action: async () => {
        showLoading("Eliminando producto...");
        await deleteProductAction(id);
        hideLoading();
        return true;
      },
      onSuccess: () => {
        showToast("Producto eliminado", "success");
        onDeleted?.(id);
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo eliminar el producto", "error");
      },
    });
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/productos/${id}`);
  };

  return (
    <div className="space-y-6">
      <AdminProductsSearch
        query={inputValue}
        totalCount={filtered.length}
        onChange={setInputValue}
      />

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 min-w-[200px] flex-col">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Fecha
          </span>
          <select
            value={orderFilter}
            onChange={(event) => setOrderFilter(event.target.value as OrderFilter)}
            className="mt-1 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
          >
            <option value="recent">Más recientes</option>
            <option value="old">Más antiguos</option>
          </select>
        </div>

        <div className="flex flex-1 min-w-[200px] flex-col">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Visibilidad
          </span>
          <select
            value={visibilityFilter}
            onChange={(event) =>
              setVisibilityFilter(event.target.value as VisibilityFilter)
            }
            className="mt-1 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
          >
            <option value="all">Todos</option>
            <option value="visible">Visible</option>
            <option value="hidden">Oculto</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-white p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-accent dark:bg-tournament-dark-surface dark:text-slate-300">
          No hay productos para mostrar.
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-xl border border-tournament-dark-accent bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-tournament-dark-border/60 text-xs uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Lanzamiento</th>
                    <th className="px-4 py-3">Índice</th>
                    <th className="px-4 py-3">Visible</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((product) => {
                    const imageSrc = resolveProductImage(product.imageUrl);

                    return (
                      <tr
                        key={product.id}
                        role="button"
                        onClick={() => handleRowClick(product.id)}
                        className="cursor-pointer border-b border-tournament-dark-border/40 text-slate-700 transition hover:bg-slate-50 last:border-b-0 dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-lg border border-tournament-dark-accent bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
                              {imageSrc ? (
                                <Image
                                  src={imageSrc}
                                  alt={product.name}
                                  width={72}
                                  height={72}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                  Sin imagen
                                </span>
                              )}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">{product.code}</td>
                        <td className="px-4 py-3 text-xs">
                          {product.releaseDate}
                        </td>
                        <td className="px-4 py-3 text-xs">{product.index}</td>
                        <td className="px-4 py-3 text-xs">
                          <span
                            className={clsx(
                              "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset",
                              product.show
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-500/30"
                                : "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-tournament-dark-muted dark:text-slate-300 dark:ring-tournament-dark-border",
                            )}
                          >
                            {product.show ? "Visible" : "Oculto"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            title="Eliminar"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(product.id);
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500 text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
                          >
                            <IoTrashOutline size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {paginated.map((product) => {
              const imageSrc = resolveProductImage(product.imageUrl);

              return (
                <div
                  key={product.id}
                  role="button"
                  onClick={() => handleRowClick(product.id)}
                  className="rounded-xl border border-tournament-dark-accent bg-white p-4 shadow-sm transition hover:bg-slate-50 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:hover:bg-tournament-dark-muted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg border border-tournament-dark-accent bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={product.name}
                            width={72}
                            height={72}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                            Sin imagen
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {product.code}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      title="Eliminar"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(product.id);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-500 text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{product.releaseDate}</span>
                    <span>Índice: {product.index}</span>
                    <span>{product.show ? "Visible" : "Oculto"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <PaginationLine
            totalPages={totalPages}
            currentPage={currentPage}
            pathname={pathname}
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
};
