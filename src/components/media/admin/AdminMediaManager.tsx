"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  IoCloudUploadOutline,
  IoChevronBack,
  IoChevronForward,
  IoCloseOutline,
  IoImagesOutline,
  IoNewspaperOutline,
  IoPersonCircleOutline,
  IoBagHandleOutline,
  IoLayersOutline,
  IoTrashOutline,
} from "react-icons/io5";
import type { ReadonlyURLSearchParams } from "next/navigation";
import {
  deleteMediaImageAction,
  getMediaImagesAction,
  uploadMediaImageAction,
} from "@/actions";
import {
  MEDIA_GROUPS,
  MEDIA_SECTION_CONFIG,
  type MediaSectionKey,
} from "@/models/media.models";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { toBlobPath, toBlobUrl } from "@/utils/blob-path";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";
import { Modal } from "@/components/ui/modal/modal";
import { ProfileMediaManager } from "./ProfileMediaManager";

const PAGE_SIZE = 16;
const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

const getFileLabel = (url: string) => {
  const clean = toBlobPath(url);
  return clean.split("/").pop() ?? url;
};

export const AdminMediaManager = () => {
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );

  const [activeGroup, setActiveGroup] = useState(MEDIA_GROUPS[0].id);
  const [activeSection, setActiveSection] = useState<MediaSectionKey>(
    MEDIA_GROUPS[0].sections[0],
  );
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const isProfileSection =
    activeSection === "profile-avatars" || activeSection === "profile-banners";
  const currentGroup = useMemo(
    () => MEDIA_GROUPS.find((group) => group.id === activeGroup),
    [activeGroup],
  );
  const sectionConfig = MEDIA_SECTION_CONFIG[activeSection];
  const groupIcons: Record<string, ReactNode> = {
    news: <IoNewspaperOutline className="h-4 w-4" />,
    profile: <IoPersonCircleOutline className="h-4 w-4" />,
    products: <IoBagHandleOutline className="h-4 w-4" />,
    cards: <IoLayersOutline className="h-4 w-4" />,
  };

  useEffect(() => {
    if (!currentGroup) return;
    if (!currentGroup.sections.includes(activeSection)) {
      setActiveSection(currentGroup.sections[0]);
    }
  }, [currentGroup, activeSection]);

  useEffect(() => {
    let active = true;

    const loadImages = async () => {
      try {
        setLoading(true);
        setError(null);
        if (isProfileSection) {
          if (active) {
            setImages([]);
            setLoading(false);
          }
          return;
        }
        const list = await getMediaImagesAction(activeSection);
        if (active) {
          setImages(list);
        }
      } catch (err) {
        if (active) {
          setImages([]);
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las imágenes",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadImages();

    return () => {
      active = false;
    };
  }, [activeSection, isProfileSection]);

  const filteredImages = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return images;
    return images.filter((item) =>
      getFileLabel(item).toLowerCase().includes(term),
    );
  }, [images, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredImages.length / PAGE_SIZE));

  const pageImages = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredImages.slice(start, start + PAGE_SIZE);
  }, [filteredImages, currentPage]);

  const previewImages = filteredImages.length > 0 ? filteredImages : images;
  const previewImage = previewImages[previewIndex] ?? null;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeSection]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (previewIndex >= previewImages.length) {
      setPreviewIndex(0);
    }
  }, [previewImages.length, previewIndex]);

  useEffect(() => {
    if (!isPreviewOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    // Bloquea el scroll del body mientras el modal esta abierto.
    document.body.style.overflow = "hidden";
    // Evita el salto visual al ocultar el scrollbar.
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [isPreviewOpen]);

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    if (files.length > 20) {
      showToast("Solo puedes subir hasta 20 imágenes por carga.", "error");
      return;
    }

    try {
      showLoading("Subiendo imágenes...");
      const uploaded: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("section", activeSection);
        formData.append("file", file);
        const response = await uploadMediaImageAction(formData);
        uploaded.push(response.pathname);
      }

      if (uploaded.length > 0) {
        setImages((prev) => [...uploaded, ...prev]);
        showToast("Imágenes subidas correctamente", "success");
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudo subir la imagen",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const handleRequestUpload = (files: File[]) => {
    if (files.length === 0) return;
    if (files.length > 20) {
      showToast("Solo puedes subir hasta 20 imágenes por carga.", "error");
      return;
    }

    openConfirmation({
      text: "¿Deseas subir estas imágenes?",
      description: `Se subirán ${files.length} archivo(s) a ${sectionConfig.label}.`,
      action: async () => {
        await handleUpload(files);
        return true;
      },
      onSuccess: () => {},
      onError: () => {},
    });
  };

  const handleOpenPreview = (url: string) => {
    const nextIndex = previewImages.findIndex((item) => item === url);
    setPreviewIndex(nextIndex >= 0 ? nextIndex : 0);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handlePrevPreview = () => {
    if (previewImages.length === 0) return;
    setPreviewIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1,
    );
  };

  const handleNextPreview = () => {
    if (previewImages.length === 0) return;
    setPreviewIndex((prev) =>
      prev === previewImages.length - 1 ? 0 : prev + 1,
    );
  };

  const handleDelete = (url: string) => {
    openConfirmation({
      text: "¿Deseas eliminar esta imagen?",
      description: "Solo se eliminará si no está en uso dentro del sistema.",
      action: async () => {
        showLoading("Eliminando imagen...");
        try {
          await deleteMediaImageAction(activeSection, url);
          return true;
        } catch (error) {
          showToast(
            error instanceof Error
              ? error.message
              : "No se pudo eliminar la imagen",
            "error",
          );
          return false;
        } finally {
          hideLoading();
        }
      },
      onSuccess: () => {
        setImages((prev) => prev.filter((item) => item !== url));
        showToast("Imagen eliminada", "success");
      },
      onError: () => {
        hideLoading();
      },
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Administración de medios
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gestiona las imágenes almacenadas en Blob para cada sección del
          proyecto.
        </p>
      </header>

      <div className="space-y-0 overflow-hidden rounded-tr-2xl">
        <div className="flex flex-wrap items-end gap-2 border-b border-tournament-dark-accent dark:border-tournament-dark-border">
          {MEDIA_GROUPS.map((group) => {
            const isActive = activeGroup === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroup(group.id)}
                className={clsx(
                  "relative -mb-px inline-flex items-center gap-2 rounded-t-xl border border-b-0 px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "border-purple-500 bg-white text-purple-700 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-purple-200"
                    : "border-tournament-dark-accent bg-slate-100 text-slate-500 hover:border-purple-400 hover:text-slate-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300 dark:hover:bg-tournament-dark-muted-strong dark:hover:text-purple-100",
                )}
              >
                {groupIcons[group.id] ?? <IoImagesOutline className="h-4 w-4" />}
                <span
                  className={clsx(
                    "whitespace-nowrap",
                    isActive ? "inline" : "hidden sm:inline",
                  )}
                >
                  {group.label}
                </span>
              </button>
            );
          })}
        </div>

        <section className="-mt-px space-y-5 rounded-b-2xl border border-tournament-dark-accent border-t-0 bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
          {currentGroup && currentGroup.sections.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {currentGroup.sections.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={clsx(
                    "rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition",
                    activeSection === section
                      ? "border-purple-500 bg-purple-100 text-purple-700 dark:bg-purple-600/20 dark:text-purple-200"
                      : "border-tournament-dark-accent bg-white text-slate-600 hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200",
                  )}
                >
                  {MEDIA_SECTION_CONFIG[section].label}
                </button>
              ))}
            </div>
          )}
          {isProfileSection ? (
            <ProfileMediaManager
              section={activeSection as "profile-avatars" | "profile-banners"}
              type={activeSection === "profile-avatars" ? "AVATAR" : "BANNER"}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                    <IoImagesOutline size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {sectionConfig.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Limite de carga: {sectionConfig.maxSizeMb}MB
                    </p>
                  </div>
                </div>
                {sectionConfig.allowUpload && (
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-purple-500 bg-purple-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-purple-700">
                    <IoCloudUploadOutline size={16} />
                    Subir nueva
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => {
                        const files = event.target.files
                          ? Array.from(event.target.files)
                          : [];
                        event.target.value = "";
                        handleRequestUpload(files);
                      }}
                    />
                  </label>
                )}
              </div>

              {!sectionConfig.allowUpload && !sectionConfig.allowDelete && (
                <div className="rounded-xl border border-dashed border-tournament-dark-accent bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong dark:text-slate-300">
                  Esta sección está disponible para futura carga de imágenes.
                </div>
              )}

              {(sectionConfig.allowUpload || sectionConfig.allowDelete) && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
                      <input
                        type="text"
                        placeholder="Buscar por nombre de archivo"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {filteredImages.length} resultados
                    </span>
                  </div>

                  {error && !loading && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
                      {error}
                    </div>
                  )}

                  <div className="relative max-h-[520px] min-h-[280px] overflow-y-auto rounded-lg border border-dashed border-tournament-dark-accent bg-slate-50 p-4 dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong">
                    {loading ? (
                      <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                        Cargando imágenes...
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {pageImages.map((url) => {
                          const imageSrc = toBlobUrl(url);
                          return (
                            <div
                              key={url}
                              className="relative flex flex-col overflow-hidden rounded-lg border border-transparent bg-white shadow-sm transition hover:border-purple-400 dark:bg-tournament-dark-surface"
                            >
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(url)}
                                className="relative flex h-36 items-center justify-center bg-slate-100 dark:bg-tournament-dark-muted"
                                title="Ver imagen"
                              >
                                <Image
                                  src={imageSrc}
                                  alt={getFileLabel(url)}
                                  width={480}
                                  height={240}
                                  className="h-full w-full object-contain"
                                />
                              </button>
                              <div className="flex items-center gap-2 p-3">
                                <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                                  {getFileLabel(url)}
                                </span>
                              </div>
                              {sectionConfig.allowDelete && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(url)}
                                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-400 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                                  title="Eliminar imagen"
                                >
                                  <IoTrashOutline size={18} />
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {filteredImages.length === 0 && !loading && (
                          <div className="col-span-full flex items-center justify-center py-12 text-sm text-slate-500 dark:text-slate-400">
                            No hay imágenes disponibles para esta sección.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <PaginationLine
                    currentPage={currentPage}
                    totalPages={totalPages}
                    searchParams={EMPTY_SEARCH_PARAMS}
                    pathname=""
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </>
          )}
        </section>
      </div>

      {isPreviewOpen && previewImage && (
        <Modal
          className="inset-0 flex items-center justify-center p-4"
          close={handleClosePreview}
          hideCloseButton
        >
          <div className="relative h-full w-full overflow-hidden border-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-2xl sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-5xl sm:rounded-lg sm:mx-4 sm:my-6 dark:border-2 dark:border-tournament-dark-border dark:from-slate-950 dark:via-tournament-dark-surface dark:to-tournament-dark-bg">
            <div className="flex items-center justify-between border-b border-purple-600 bg-slate-100/90 px-6 py-4 dark:border-tournament-dark-border dark:bg-slate-950/70">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">
                  {sectionConfig.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {getFileLabel(previewImage)}
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar vista previa"
                onClick={handleClosePreview}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-slate-600 transition hover:border-purple-400 hover:text-purple-600 dark:border dark:border-tournament-dark-border dark:bg-slate-950/80 dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
              >
                <IoCloseOutline className="h-6 w-6" />
              </button>
            </div>

            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={handlePrevPreview}
              className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-purple-600 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/90 dark:text-white dark:hover:bg-tournament-dark-muted-hover"
            >
              <IoChevronBack className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              onClick={handleNextPreview}
              className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg border border-purple-600 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-muted/90 dark:text-white dark:hover:bg-tournament-dark-muted-hover"
            >
              <IoChevronForward className="h-6 w-6" />
            </button>

            <div className="grid h-[calc(100vh-72px)] grid-cols-1 overflow-y-auto px-4 pb-6 sm:h-auto sm:max-h-[calc(85vh-72px)]">
              <div className="relative flex flex-col items-center gap-4 py-6">
                <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-slate-950/80 shadow-lg shadow-gray-300/60 dark:bg-tournament-dark-muted-strong/40 dark:shadow-2xl dark:shadow-white/10">
                  <Image
                    src={toBlobUrl(previewImage)}
                    alt={getFileLabel(previewImage)}
                    width={1400}
                    height={900}
                    className="block w-full object-contain"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {previewIndex + 1} / {previewImages.length}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
