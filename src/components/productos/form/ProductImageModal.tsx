"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { FiSearch, FiUpload, FiX } from "react-icons/fi";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { uploadMediaImageAction } from "@/actions";
import { Modal } from "@/components/ui/modal/modal";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import { useToastStore, useUIStore } from "@/store";
import { toAssetPath, toProductImageUrl } from "@/utils/asset-path";

const PAGE_SIZE = 32;
const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

type Props = {
  isOpen: boolean;
  images: string[];
  selectedImage: string | null;
  onSelect: (image: string) => void;
  onImageUploaded?: (image: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export const ProductImageModal = ({
  isOpen,
  images,
  selectedImage,
  onSelect,
  onImageUploaded,
  onClose,
  onConfirm,
}: Props) => {
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const filteredImages = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return images;

    return images.filter((image) => {
      const normalized = image.toLowerCase();
      const filename = toAssetPath(image).split("/").pop() ?? image;
      const code = filename.replace(/\.[^/.]+$/, "").toLowerCase();
      return normalized.includes(query) || code.includes(query);
    });
  }, [images, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredImages.length / PAGE_SIZE));

  const pageImages = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredImages.slice(start, start + PAGE_SIZE);
  }, [filteredImages, currentPage]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPage(1);
    setSearchValue("");
  }, [isOpen]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPage(1);
  }, [searchValue, isOpen]);

  const handleUploadImage = async (file?: File) => {
    if (!file) return;

    try {
      setIsUploading(true);
      showLoading("Subiendo imagen del producto...");

      const formData = new FormData();
      formData.append("section", "products");
      formData.append("file", file);

      const response = await uploadMediaImageAction(formData);
      onImageUploaded?.(response.pathname);
      onSelect(response.pathname);
      setSearchValue("");
      setCurrentPage(1);
      showToast("Imagen subida correctamente", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "No se pudo subir la imagen",
        "error",
      );
    } finally {
      setIsUploading(false);
      hideLoading();
    }
  };

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
                Seleccionar imagen del producto
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Elige la imagen base que representará este producto.
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

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
            <label className="relative">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar por código"
                className="w-full rounded-lg border border-tournament-dark-accent bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
              />
            </label>
            <label
              className={clsx(
                "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-purple-500 bg-purple-600 px-4 text-sm font-semibold text-white transition hover:bg-purple-700",
                isUploading && "cursor-not-allowed opacity-70",
              )}
            >
              <FiUpload className="h-4 w-4" />
              {isUploading ? "Subiendo..." : "Subir nueva"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  void handleUploadImage(file);
                }}
              />
            </label>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {filteredImages.length} resultados
            </span>
          </div>

          <div className="relative max-h-[420px] min-h-[320px] overflow-y-auto rounded-lg border border-dashed border-tournament-dark-accent bg-slate-50 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageImages.map((image) => {
                const isSelected = image === selectedImage;
                const filename = toAssetPath(image).split("/").pop() ?? image;
                const resolvedSrc = toProductImageUrl(image);

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
                        src={resolvedSrc}
                        alt={filename}
                        width={520}
                        height={260}
                        className="h-auto w-full rounded-md object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="mt-auto block truncate pt-2 text-xs text-slate-500 dark:text-slate-400">
                      {filename}
                    </span>
                  </button>
                );
              })}

              {pageImages.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-10 text-sm text-slate-500 dark:text-slate-400">
                  No hay imágenes disponibles en R2 para esta búsqueda.
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
