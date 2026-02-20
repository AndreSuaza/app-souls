"use client";

import clsx from "clsx";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import { Modal } from "../modal/modal";

type ProductSearchResult = {
  id: string;
  name: string;
  imageUrl: string | null;
};

const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  products: ProductSearchResult[];
  selectedProductId: string | null;
  onSelectProduct: (productId: string) => void;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onInsert: () => void;
};

export const MarkdownProductModal = ({
  isOpen,
  onClose,
  products,
  selectedProductId,
  onSelectProduct,
  isLoading,
  error,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
  onInsert,
}: Props) => {
  if (!isOpen) return null;

  return (
    <Modal
      className="inset-0 flex items-center justify-center p-4"
      close={onClose}
      hideCloseButton
    >
      <div className="w-full max-w-6xl rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Seleccionar producto
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Elige un producto para insertarlo en el contenido.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-tournament-dark-accent text-slate-500 transition hover:bg-slate-100 hover:text-purple-600 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-purple-300"
              aria-label="Cerrar"
              title="Cerrar"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-end">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {totalCount} resultados
            </span>
          </div>

          <div className="relative max-h-[420px] min-h-[320px] overflow-y-auto rounded-lg border border-dashed border-tournament-dark-accent bg-slate-50 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((product) => {
                const src = product.imageUrl
                  ? `/products/${product.imageUrl}.webp`
                  : null;
                const isSelected = selectedProductId === product.id;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => onSelectProduct(product.id)}
                    className={clsx(
                      "relative rounded-lg border bg-white p-2 text-center transition hover:border-purple-400 dark:bg-tournament-dark-surface",
                      isSelected
                        ? "border-purple-500 ring-2 ring-purple-400/40"
                        : "border-transparent",
                    )}
                  >
                    <div className="flex h-[180px] w-full items-center justify-center rounded-md bg-slate-100 dark:bg-tournament-dark-muted">
                      {src ? (
                        <Image
                          src={src}
                          alt={product.name}
                          width={160}
                          height={160}
                          className="h-auto w-full rounded-md object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          Sin imagen
                        </span>
                      )}
                    </div>
                    <span className="mt-2 block truncate text-xs text-slate-500 dark:text-slate-400">
                      {product.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 text-sm text-slate-500 backdrop-blur-sm dark:bg-tournament-dark-muted-strong/80 dark:text-slate-300">
                Buscando productos...
              </div>
            )}
            {error && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-rose-500 dark:text-rose-300">
                {error}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <PaginationLine
              currentPage={currentPage}
              totalPages={totalPages}
              searchParams={EMPTY_SEARCH_PARAMS}
              pathname=""
              onPageChange={onPageChange}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {selectedProductId ? "1 seleccionado" : "0 seleccionados"}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onInsert}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700"
                disabled={!selectedProductId}
              >
                Insertar producto
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
