"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  IoChevronBack,
  IoChevronForward,
  IoCloseOutline,
  IoCloudUploadOutline,
  IoCreateOutline,
  IoImagesOutline,
  IoTrashOutline,
} from "react-icons/io5";
import type { ReadonlyURLSearchParams } from "next/navigation";
import {
  createProfileMediaAction,
  deleteProfileMediaAction,
  getAdminProfileMediaAction,
  updateProfileMediaAction,
} from "@/actions";
import { Modal } from "@/components/ui/modal/modal";
import {
  AVATAR_AVAILABILITIES,
  AVATAR_RARITIES,
  normalizeAvatarRarity,
  resolveAvatarRarityLabel,
} from "@/models/avatar.models";
import {
  MEDIA_SECTION_CONFIG,
  type MediaSectionKey,
} from "@/models/media.models";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { toAssetPath, toAssetStorageUrl } from "@/utils/asset-path";
import { PaginationLine } from "@/components/ui/pagination/paginationLine";

type ProfileMediaType = "AVATAR" | "BANNER" | "FRAME";

const PAGE_SIZE = 16;
const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

type ProfileMediaItem = {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  availability: string | null;
  price: number | null;
  type: ProfileMediaType;
  storeVisible: boolean;
  isSeasonal: boolean;
  seasonNumber: number | null;
  seasonEndsAt: Date | string | null;
  featured: boolean;
  featuredOrder: number;
};

type FormState = {
  name: string;
  rarity: string;
  availability: string;
  price: number;
  storeVisible: boolean;
  isSeasonal: boolean;
  seasonNumber: string;
  seasonEndsAt: string;
  featured: boolean;
  featuredOrder: number;
};

type Props = {
  section: "profile-avatars" | "profile-banners" | "profile-frames";
  type: ProfileMediaType;
};

const getFileLabel = (url: string) => {
  const clean = toAssetPath(url);
  return clean.split("/").pop() ?? url;
};

const DEFAULT_FORM_STATE: FormState = {
  name: "",
  rarity: AVATAR_RARITIES[0]?.value ?? "COMMON",
  availability: AVATAR_AVAILABILITIES[0]?.value ?? "PUBLIC",
  price: 0,
  storeVisible: true,
  isSeasonal: false,
  seasonNumber: "",
  seasonEndsAt: "",
  featured: false,
  featuredOrder: 0,
};

const resolveRarityLabel = (rarity: string) => resolveAvatarRarityLabel(rarity);

const resolveAvailabilityLabel = (availability: string | null) =>
  AVATAR_AVAILABILITIES.find((item) => item.value === availability)?.label ??
  "Público";

export const ProfileMediaManager = ({ section, type }: Props) => {
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );

  const sectionConfig = MEDIA_SECTION_CONFIG[section as MediaSectionKey];

  const [items, setItems] = useState<ProfileMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("ALL");
  const [selectedAvailability, setSelectedAvailability] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProfileMediaItem | null>(null);
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFilePreviewUrl, setFormFilePreviewUrl] = useState<string | null>(
    null,
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await getAdminProfileMediaAction(type);
        if (active) {
          setItems(list as ProfileMediaItem[]);
        }
      } catch (err) {
        if (active) {
          setItems([]);
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

    load();

    return () => {
      active = false;
    };
  }, [type]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedRarity, selectedAvailability]);

  useEffect(() => {
    if (!formFile) {
      setFormFilePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(formFile);
    setFormFilePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formFile]);

  const filteredItems = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = term
        ? item.name.toLowerCase().includes(term)
        : true;
      const matchesRarity =
        selectedRarity === "ALL" || item.rarity === selectedRarity;
      const availabilityValue = item.availability ?? "PUBLIC";
      const matchesAvailability =
        selectedAvailability === "ALL" ||
        availabilityValue === selectedAvailability;
      return matchesSearch && matchesRarity && matchesAvailability;
    });
  }, [items, debouncedSearch, selectedRarity, selectedAvailability]);

  const previewItems = filteredItems.length > 0 ? filteredItems : items;
  const previewItem = previewItems[previewIndex] ?? null;

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormState({
      ...DEFAULT_FORM_STATE,
      availability:
        type === "FRAME" ? "STORE" : DEFAULT_FORM_STATE.availability,
    });
    setFormFile(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item: ProfileMediaItem) => {
    const seasonEndsAt = item.seasonEndsAt
      ? new Date(item.seasonEndsAt).toISOString().slice(0, 10)
      : "";

    setEditingItem(item);
    setFormState({
      name: item.name,
      rarity: normalizeAvatarRarity(item.rarity),
      availability: item.availability ?? "PUBLIC",
      price:
        (item.availability ?? "PUBLIC") === "STORE" ? (item.price ?? 0) : 0,
      storeVisible: item.storeVisible ?? true,
      isSeasonal: item.isSeasonal ?? false,
      seasonNumber: item.seasonNumber ? String(item.seasonNumber) : "",
      seasonEndsAt,
      featured: item.featured ?? false,
      featuredOrder: item.featuredOrder ?? 0,
    });
    setFormFile(null);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setFormFile(null);
  };

  const handleSave = async () => {
    if (!editingItem && !formFile) {
      showToast("Selecciona una imagen para continuar", "error");
      return;
    }

    if (formState.isSeasonal) {
      const seasonNumber = Number(formState.seasonNumber || 0);
      if (!Number.isInteger(seasonNumber) || seasonNumber < 1) {
        showToast("La temporada debe ser mayor o igual a 1.", "error");
        return;
      }
    }

    if (
      (formState.storeVisible || formState.featured || formState.isSeasonal) &&
      formState.availability !== "STORE"
    ) {
      showToast(
        "Para aparecer en la tienda, la disponibilidad debe ser 'Tienda'.",
        "error",
      );
      return;
    }

    try {
      showLoading(
        editingItem ? "Actualizando imagen..." : "Subiendo imagen...",
      );

      const nextPrice =
        formState.availability === "STORE" ? formState.price : 0;
      const nextSeasonNumber = formState.isSeasonal
        ? Number(formState.seasonNumber || 0)
        : null;
      const nextSeasonEndsAt = formState.isSeasonal
        ? formState.seasonEndsAt || null
        : null;

      if (editingItem) {
        const updated = await updateProfileMediaAction({
          id: editingItem.id,
          name: formState.name,
          rarity: formState.rarity,
          availability: formState.availability,
          price: nextPrice,
          storeVisible: formState.storeVisible,
          isSeasonal: formState.isSeasonal,
          seasonNumber: nextSeasonNumber,
          seasonEndsAt: nextSeasonEndsAt,
          featured: formState.featured,
          featuredOrder: formState.featuredOrder,
        });
        setItems((prev) =>
          prev.map((item) =>
            item.id === updated.id ? (updated as ProfileMediaItem) : item,
          ),
        );
        showToast("Imagen actualizada", "success");
      } else {
        const payload = new FormData();
        payload.append("file", formFile as File);
        payload.append("name", formState.name);
        payload.append("rarity", formState.rarity);
        payload.append("availability", formState.availability);
        payload.append("price", String(nextPrice ?? 0));
        payload.append("type", type);
        payload.append("storeVisible", String(formState.storeVisible));
        payload.append("isSeasonal", String(formState.isSeasonal));
        payload.append("seasonNumber", String(nextSeasonNumber ?? ""));
        payload.append("seasonEndsAt", String(nextSeasonEndsAt ?? ""));
        payload.append("featured", String(formState.featured));
        payload.append("featuredOrder", String(formState.featuredOrder ?? 0));

        const created = await createProfileMediaAction(payload);
        setItems((prev) => [created as ProfileMediaItem, ...prev]);
        showToast("Imagen creada", "success");
      }

      closeFormModal();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "No se pudo guardar la imagen",
        "error",
      );
    } finally {
      hideLoading();
    }
  };

  const handleDelete = (item: ProfileMediaItem) => {
    openConfirmation({
      text: "¿Deseas eliminar esta imagen?",
      description: "Solo se eliminará si no está en uso dentro del sistema.",
      action: async () => {
        showLoading("Eliminando imagen...");
        try {
          await deleteProfileMediaAction(item.id);
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
        setItems((prev) => prev.filter((avatar) => avatar.id !== item.id));
        showToast("Imagen eliminada", "success");
      },
      onError: () => {
        hideLoading();
      },
    });
  };

  useEffect(() => {
    if (previewIndex >= previewItems.length) {
      setPreviewIndex(0);
    }
  }, [previewItems.length, previewIndex]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

  const handleOpenPreview = (itemId: string) => {
    const nextIndex = previewItems.findIndex((item) => item.id === itemId);
    setPreviewIndex(nextIndex >= 0 ? nextIndex : 0);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const handlePrevPreview = () => {
    if (previewItems.length === 0) return;
    setPreviewIndex((prev) =>
      prev === 0 ? previewItems.length - 1 : prev - 1,
    );
  };

  const handleNextPreview = () => {
    if (previewItems.length === 0) return;
    setPreviewIndex((prev) =>
      prev === previewItems.length - 1 ? 0 : prev + 1,
    );
  };

  return (
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
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg border border-purple-500 bg-purple-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-purple-700"
          >
            <IoCloudUploadOutline size={16} />
            Subir nueva
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap lg:items-center">
          <div className="flex w-full items-center gap-2 rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 lg:max-w-sm dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex w-full sm:w-44 lg:w-44">
            <select
              value={selectedRarity}
              onChange={(event) => setSelectedRarity(event.target.value)}
              className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
            >
              <option value="ALL">Todas las rarezas</option>
              {AVATAR_RARITIES.map((rarity) => (
                <option key={rarity.value} value={rarity.value}>
                  {rarity.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-full sm:w-48 lg:w-48">
            <select
              value={selectedAvailability}
              onChange={(event) => setSelectedAvailability(event.target.value)}
              className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
            >
              <option value="ALL">Todas las zonas</option>
              {AVATAR_AVAILABILITIES.map((availability) => (
                <option key={availability.value} value={availability.value}>
                  {availability.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 lg:ml-auto lg:whitespace-nowrap">
          {filteredItems.length} resultados
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
            {pageItems.map((item) => (
              <div
                key={item.id}
                className="relative flex flex-col overflow-hidden rounded-lg border border-transparent bg-white shadow-sm transition hover:border-purple-400 dark:bg-tournament-dark-surface"
              >
                <button
                  type="button"
                  onClick={() => handleOpenPreview(item.id)}
                  className="relative flex h-36 items-center justify-center bg-slate-100 dark:bg-tournament-dark-muted"
                  title="Ver imagen"
                >
                  <Image
                    src={toAssetStorageUrl(item.imageUrl)}
                    alt={item.name}
                    width={480}
                    height={240}
                    className="h-full w-full object-contain"
                  />
                </button>
                <div className="flex flex-col gap-2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-purple-400 hover:text-purple-600 dark:border-tournament-dark-border dark:text-slate-300"
                      title="Editar"
                    >
                      <IoCreateOutline size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600 dark:bg-tournament-dark-muted dark:text-slate-200">
                      {resolveRarityLabel(item.rarity)}
                    </span>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-700 dark:bg-tournament-dark-muted dark:text-slate-200">
                      {resolveAvailabilityLabel(item.availability)}
                    </span>
                    {(item.price ?? 0) > 0 && (
                      <span className="rounded-full bg-purple-100 px-2 py-1 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                        {item.price} PV
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-1 ${
                        item.storeVisible
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {item.storeVisible ? "Visible" : "Oculta"}
                    </span>
                    {item.featured && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                        Destacado #{item.featuredOrder ?? 0}
                      </span>
                    )}
                    {item.isSeasonal && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-red-700 dark:bg-red-500/20 dark:text-red-200">
                        Temp. {item.seasonNumber ?? "-"}
                      </span>
                    )}
                  </div>
                  <span className="truncate text-xs text-slate-400 dark:text-slate-500">
                    {getFileLabel(item.imageUrl)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-400 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                  title="Eliminar imagen"
                >
                  <IoTrashOutline size={18} />
                </button>
              </div>
            ))}

            {filteredItems.length === 0 && !loading && (
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

      {isFormOpen && (
        <Modal
          className="inset-0 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
          close={closeFormModal}
          hideCloseButton
        >
          <div className="my-4 w-full max-w-2xl overflow-y-auto rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-xl max-h-[calc(100dvh-2rem)] dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {editingItem ? "Editar imagen" : "Subir imagen"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {sectionConfig.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-tournament-dark-accent text-slate-500 transition hover:bg-slate-100 hover:text-purple-600 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-purple-300"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <IoCloseOutline className="h-4 w-4" />
                </button>
              </div>

              {!editingItem && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Archivo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setFormFile(file);
                    }}
                    className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-purple-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-purple-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
                  />
                  <p className="text-xs text-slate-400">
                    Maximo {sectionConfig.maxSizeMb}MB. Se convierte a WebP.
                  </p>
                  {formFile && formFilePreviewUrl && (
                    <div className="mt-2 overflow-hidden rounded-xl border border-tournament-dark-accent bg-slate-50 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-tournament-dark-accent px-3 py-2 text-xs dark:border-tournament-dark-border">
                        <span className="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                          Vista previa
                        </span>
                        <span className="max-w-[70%] truncate text-slate-400">
                          {formFile.name}
                        </span>
                      </div>
                      <div className="flex min-h-44 items-center justify-center p-3">
                        <Image
                          src={formFilePreviewUrl}
                          alt={`Vista previa de ${formFile.name}`}
                          width={640}
                          height={360}
                          unoptimized
                          className="max-h-64 w-auto max-w-full rounded-lg object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Nombre
                </span>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
                  placeholder="Nombre visible"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Rareza
                </span>
                <select
                  value={formState.rarity}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      rarity: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
                >
                  {AVATAR_RARITIES.map((rarity) => (
                    <option key={rarity.value} value={rarity.value}>
                      {rarity.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={`grid gap-4 ${
                  formState.availability === "STORE"
                    ? "sm:grid-cols-2"
                    : "sm:grid-cols-1"
                }`}
              >
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Disponibilidad
                  </span>
                  <select
                    value={formState.availability}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        availability: event.target.value,
                        price: event.target.value === "STORE" ? prev.price : 0,
                      }))
                    }
                    className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
                  >
                    {AVATAR_AVAILABILITIES.map((availability) => (
                      <option
                        key={availability.value}
                        value={availability.value}
                      >
                        {availability.label}
                      </option>
                    ))}
                  </select>
                </div>
                {formState.availability === "STORE" && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Precio (PV)
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min={0}
                      step={1}
                      value={
                        formState.price === 0 ? "" : String(formState.price)
                      }
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          price: Number(
                            event.target.value.replace(/[^0-9]/g, "") || 0,
                          ),
                        }))
                      }
                      className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center justify-between rounded-lg border border-tournament-dark-accent bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200">
                  Visible en tienda
                  <input
                    type="checkbox"
                    checked={formState.storeVisible}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        storeVisible: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-purple-600"
                  />
                </label>
                <label className="flex items-center justify-between rounded-lg border border-tournament-dark-accent bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200">
                  Destacado
                  <input
                    type="checkbox"
                    checked={formState.featured}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        featured: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-purple-600"
                  />
                </label>
              </div>

              {formState.featured && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Orden destacado
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={0}
                    step={1}
                    value={
                      formState.featuredOrder === 0
                        ? ""
                        : String(formState.featuredOrder)
                    }
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        featuredOrder: Number(
                          event.target.value.replace(/[^0-9]/g, "") || 0,
                        ),
                      }))
                    }
                    className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
                  />
                </div>
              )}

              <label className="flex items-center justify-between rounded-lg border border-tournament-dark-accent bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200">
                Item de temporada
                <input
                  type="checkbox"
                  checked={formState.isSeasonal}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      isSeasonal: event.target.checked,
                      seasonNumber: event.target.checked
                        ? prev.seasonNumber
                        : "",
                      seasonEndsAt: event.target.checked
                        ? prev.seasonEndsAt
                        : "",
                    }))
                  }
                  className="h-4 w-4 accent-purple-600"
                />
              </label>

              {formState.isSeasonal && (
                <div className="grid gap-4 sm:grid-cols-1">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Temporada
                    </span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={formState.seasonNumber}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          seasonNumber: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
                      placeholder="Ej: 2"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700"
                >
                  {editingItem ? "Guardar" : "Subir"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {isPreviewOpen && previewItem && (
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
                  {getFileLabel(previewItem.imageUrl)}
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
                    src={toAssetStorageUrl(previewItem.imageUrl)}
                    alt={previewItem.name}
                    width={1400}
                    height={900}
                    className="block w-full object-contain"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {previewIndex + 1} / {previewItems.length}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
