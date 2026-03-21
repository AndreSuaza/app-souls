"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  IoCloudUploadOutline,
  IoImagesOutline,
  IoTrashOutline,
} from "react-icons/io5";
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

const getFileLabel = (url: string) => {
  const clean = url.split("?")[0];
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

  const currentGroup = useMemo(
    () => MEDIA_GROUPS.find((group) => group.id === activeGroup),
    [activeGroup],
  );
  const sectionConfig = MEDIA_SECTION_CONFIG[activeSection];

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
  }, [activeSection]);

  const filteredImages = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return images;
    return images.filter((item) =>
      getFileLabel(item).toLowerCase().includes(term),
    );
  }, [images, debouncedSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("section", activeSection);
    formData.append("file", file);

    try {
      showLoading("Subiendo imagen...");
      const response = await uploadMediaImageAction(formData);
      setImages((prev) => [response.url, ...prev]);
      showToast("Imagen subida correctamente", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudo subir la imagen",
        "error",
      );
    } finally {
      hideLoading();
    }
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

      <div className="flex flex-wrap gap-2">
        {MEDIA_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => setActiveGroup(group.id)}
            className={clsx(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              activeGroup === group.id
                ? "border-purple-500 bg-purple-600 text-white"
                : "border-tournament-dark-accent bg-white text-slate-600 hover:border-purple-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200",
            )}
          >
            {group.label}
          </button>
        ))}
      </div>

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

      <section className="space-y-5 rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
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
                Límite de carga: {sectionConfig.maxSizeMb}MB
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
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  event.target.value = "";
                  handleUpload(file);
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
                  {filteredImages.map((url) => (
                    <div
                      key={url}
                      className="relative flex flex-col overflow-hidden rounded-lg border border-transparent bg-white shadow-sm transition hover:border-purple-400 dark:bg-tournament-dark-surface"
                    >
                      <div className="relative flex h-36 items-center justify-center bg-slate-100 dark:bg-tournament-dark-muted">
                        <Image
                          src={url}
                          alt={getFileLabel(url)}
                          width={480}
                          height={240}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex items-center gap-2 p-3">
                        <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {getFileLabel(url)}
                        </span>
                      </div>
                      {sectionConfig.allowDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(url)}
                          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500 text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
                          title="Eliminar imagen"
                        >
                          <IoTrashOutline size={18} />
                        </button>
                      )}
                    </div>
                  ))}

                  {filteredImages.length === 0 && !loading && (
                    <div className="col-span-full flex items-center justify-center py-12 text-sm text-slate-500 dark:text-slate-400">
                      No hay imágenes disponibles para esta sección.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
