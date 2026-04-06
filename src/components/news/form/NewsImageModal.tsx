"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import clsx from "clsx";
import Image from "next/image";
import { FiX } from "react-icons/fi";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/modal/modal";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import { toBlobUrl } from "@/utils/blob-path";

const PAGE_SIZE = 32;
const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

type Props = {
  isOpen: boolean;
  images: string[];
  selectedImage: string | null;
  folder: "banners" | "cards";
  title: string;
  description: string;
  onSelect: (image: string) => void;
  onSelectFile?: (file: File, previewUrl: string) => void;
  onSelectLocalPreview?: () => void;
  localPreview?: { url: string; name: string } | null;
  onClose: () => void;
  onConfirm: () => void;
};

export const NewsImageModal = ({
  isOpen,
  images,
  selectedImage,
  title,
  description,
  onSelect,
  onSelectFile,
  onSelectLocalPreview,
  localPreview,
  onClose,
  onConfirm,
}: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredImages = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return images;
    return images.filter((image) => {
      const label = image.split("?")[0].split("/").pop() ?? image;
      return label.toLowerCase().includes(term);
    });
  }, [images, search]);

  const totalPages = Math.max(1, Math.ceil(filteredImages.length / PAGE_SIZE));

  const pageImages = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredImages.slice(start, start + PAGE_SIZE);
  }, [filteredImages, currentPage]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPage(1);
    setSearch("");
  }, [isOpen]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    onSelectFile?.(file, previewUrl);
    event.target.value = "";
  };

  const getLabel = (image: string) =>
    image.split("?")[0].split("/").pop() ?? image;

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
                {title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {description}
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
              {filteredImages.length} resultados
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre de archivo"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-purple-500 bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              Subir nueva
            </label>
          </div>

          <div className="relative max-h-[420px] min-h-[320px] overflow-y-auto rounded-lg border border-dashed border-tournament-dark-accent bg-slate-50 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {localPreview && (
                <button
                  type="button"
                  onClick={onSelectLocalPreview}
                  className={clsx(
                    "relative flex h-full min-h-[220px] flex-col rounded-lg border bg-white p-2 text-left transition hover:border-purple-400 dark:bg-tournament-dark-surface",
                    localPreview.url === selectedImage
                      ? "border-purple-500 ring-2 ring-purple-400/40"
                      : "border-transparent",
                  )}
                >
                  <div className="flex flex-1 items-center justify-center">
                    <Image
                      src={localPreview.url}
                      alt={localPreview.name}
                      width={520}
                      height={260}
                      unoptimized
                      className="h-auto w-full rounded-md object-cover"
                    />
                  </div>
                  <span className="mt-auto block truncate pt-2 text-xs text-slate-500 dark:text-slate-400">
                    {localPreview.name} (local)
                  </span>
                </button>
              )}
              {pageImages.map((image) => {
                const isSelected = image === selectedImage;
                const label = getLabel(image);
                const imageSrc = toBlobUrl(image);

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
                        src={imageSrc}
                        alt={label}
                        width={520}
                        height={260}
                        className="h-auto w-full rounded-md object-cover"
                      />
                    </div>
                    <span className="mt-auto block truncate pt-2 text-xs text-slate-500 dark:text-slate-400">
                      {label}
                    </span>
                  </button>
                );
              })}

              {pageImages.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-10 text-sm text-slate-500 dark:text-slate-400">
                  No hay imágenes disponibles en Blob para esta búsqueda.
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
