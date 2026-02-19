"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/modal/modal";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";

const PAGE_SIZE = 32;
const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

type Props = {
  isOpen: boolean;
  images: string[];
  selectedImage: string | null;
  onSelect: (image: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export const NewsImageModal = ({
  isOpen,
  images,
  selectedImage,
  onSelect,
  onClose,
  onConfirm,
}: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(images.length / PAGE_SIZE));

  const pageImages = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return images.slice(start, start + PAGE_SIZE);
  }, [images, currentPage]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPage(1);
  }, [isOpen]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
                Seleccionar imagen destacada
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Selecciona una imagen de portada para la noticia.
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
              {images.length} resultados
            </span>
          </div>

          <div className="relative max-h-[420px] min-h-[320px] overflow-y-auto rounded-lg border border-dashed border-tournament-dark-accent bg-slate-50 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageImages.map((image) => {
                const isSelected = image === selectedImage;

                return (
                  <button
                    key={image}
                    type="button"
                    onClick={() => onSelect(image)}
                    className={clsx(
                      "relative flex h-full min-h-[220px] flex-col rounded-lg border bg-white p-2 text-left transition hover:border-purple-400 dark:bg-tournament-dark-surface",
                      isSelected
                        ? "border-purple-500 ring-2 ring-purple-400/40"
                        : "border-transparent",
                    )}
                  >
                    <div className="flex flex-1 items-center justify-center">
                      <Image
                        src={`/news/${image}`}
                        alt={image}
                        width={520}
                        height={260}
                        className="h-auto w-full rounded-md object-cover"
                      />
                    </div>
                    <span className="mt-auto block truncate pt-2 text-xs text-slate-500 dark:text-slate-400">
                      {image}
                    </span>
                  </button>
                );
              })}

              {pageImages.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-10 text-sm text-slate-500 dark:text-slate-400">
                  No hay imágenes disponibles en /public/news.
                </div>
              )}
            </div>
          </div>

          <PaginationLine
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={EMPTY_SEARCH_PARAMS}
            pathname=""
            onPageChange={setCurrentPage}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {selectedImage ? "1 seleccionada" : "0 seleccionadas"}
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
                onClick={onConfirm}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700"
                disabled={!selectedImage}
              >
                Usar imagen
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
