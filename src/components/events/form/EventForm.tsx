"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { uploadMediaImageAction } from "@/actions/media/upload-media-image.action";
import { NewsImageModal } from "@/components/news/form/NewsImageModal";
import { MarkdownEditor } from "@/components/ui/markdown/MarkdownEditor";
import type {
  EventDetail,
  EventImageOptions,
  EventStatus,
} from "@/interfaces/events.interface";
import type { StoreOption } from "@/interfaces/store.interface";
import {
  CreateEventSchema,
  type CreateEventInput,
} from "@/schemas/events/event.schema";
import { useToastStore, useUIStore } from "@/store";
import { toBlobPath } from "@/utils/blob-path";

export type EventSubmitValues = CreateEventInput;

type Props = {
  initialValues?: EventDetail;
  imageOptions: EventImageOptions;
  storeOptions: StoreOption[];
  submitLabel: string;
  onSubmit: (values: EventSubmitValues) => void;
  onDelete?: () => void;
};

type FormErrors = Partial<Record<keyof EventSubmitValues, string>>;

const STATUS_OPTIONS: Array<{
  value: Exclude<EventStatus, "deleted">;
  label: string;
}> = [
  { value: "draft", label: "Borrador" },
  { value: "scheduled", label: "Programado" },
  { value: "published", label: "Publicado" },
];

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const buildInitialValues = (initialValues?: EventDetail): EventSubmitValues => ({
  title: initialValues?.title ?? "",
  subtitle: initialValues?.subtitle ?? "",
  shortSummary: initialValues?.shortSummary ?? "",
  content: initialValues?.content ?? "",
  featuredImage: initialValues?.featuredImage ?? "",
  cardImage: initialValues?.cardImage ?? "",
  startsAt: toDateTimeLocal(initialValues?.startsAt),
  endsAt: toDateTimeLocal(initialValues?.endsAt),
  status:
    initialValues?.status && initialValues.status !== "deleted"
      ? initialValues.status
      : "draft",
  badgeLabel: initialValues?.badgeLabel ?? "",
  storeId: initialValues?.storeId ?? null,
});

const FormField = ({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) => (
  <div className="space-y-2">
    <label
      htmlFor={htmlFor}
      className="text-sm font-semibold text-slate-700 dark:text-slate-200"
    >
      {label}
    </label>
    {children}
    {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
  </div>
);

const inputClassName =
  "w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500";

export const EventForm = ({
  initialValues,
  imageOptions,
  storeOptions,
  submitLabel,
  onSubmit,
  onDelete,
}: Props) => {
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const initial = useMemo(
    () => buildInitialValues(initialValues),
    [initialValues],
  );
  const [values, setValues] = useState<EventSubmitValues>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageOptionsState, setImageOptionsState] =
    useState<EventImageOptions>(imageOptions);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageFolder, setImageFolder] = useState<"banners" | "cards">(
    "banners",
  );
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingFeaturedFile, setPendingFeaturedFile] = useState<File | null>(
    null,
  );
  const [pendingFeaturedPreview, setPendingFeaturedPreview] = useState<
    string | null
  >(null);
  const [pendingCardFile, setPendingCardFile] = useState<File | null>(null);
  const [pendingCardPreview, setPendingCardPreview] = useState<string | null>(
    null,
  );
  const [stagedFeaturedFile, setStagedFeaturedFile] = useState<File | null>(
    null,
  );
  const [stagedFeaturedPreview, setStagedFeaturedPreview] = useState<
    string | null
  >(null);
  const [stagedCardFile, setStagedCardFile] = useState<File | null>(null);
  const [stagedCardPreview, setStagedCardPreview] = useState<string | null>(
    null,
  );
  const localPreviewRefs = useRef<Array<string | null>>([null, null, null, null]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setImageOptionsState(imageOptions);
  }, [imageOptions]);

  useEffect(() => {
    localPreviewRefs.current = [
      pendingFeaturedPreview,
      pendingCardPreview,
      stagedFeaturedPreview,
      stagedCardPreview,
    ];
  }, [
    pendingFeaturedPreview,
    pendingCardPreview,
    stagedFeaturedPreview,
    stagedCardPreview,
  ]);

  useEffect(() => {
    return () => {
      const previews = new Set(localPreviewRefs.current.filter(Boolean));
      previews.forEach((preview) => {
        if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      });
    };
  }, []);

  const updateField = <T extends keyof EventSubmitValues>(
    field: T,
    value: EventSubmitValues[T],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const clearFeaturedLocal = () => {
    setPendingFeaturedFile(null);
    setPendingFeaturedPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const clearCardLocal = () => {
    setPendingCardFile(null);
    setPendingCardPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const clearStagedFeatured = ({ revoke = true } = {}) => {
    setStagedFeaturedFile(null);
    setStagedFeaturedPreview((prev) => {
      if (revoke && prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const clearStagedCard = ({ revoke = true } = {}) => {
    setStagedCardFile(null);
    setStagedCardPreview((prev) => {
      if (revoke && prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handleOpenImageModal = (folder: "banners" | "cards") => {
    setImageFolder(folder);
    if (folder === "banners") {
      const currentFeatured = String(values.featuredImage).startsWith("local:")
        ? null
        : toBlobPath(String(values.featuredImage));
      clearStagedFeatured();
      setPendingImage(pendingFeaturedPreview ?? currentFeatured ?? null);
    } else {
      const currentCard = String(values.cardImage).startsWith("local:")
        ? null
        : toBlobPath(String(values.cardImage));
      clearStagedCard();
      setPendingImage(pendingCardPreview ?? currentCard ?? null);
    }
    setIsImageModalOpen(true);
  };

  const handleSelectImage = (image: string) => {
    setPendingImage(image);
    if (imageFolder === "banners") {
      clearStagedFeatured();
    } else {
      clearStagedCard();
    }
  };

  const handleSelectLocalPreview = () => {
    if (imageFolder === "banners") {
      const preview = stagedFeaturedPreview ?? pendingFeaturedPreview;
      if (preview) setPendingImage(preview);
      return;
    }

    const preview = stagedCardPreview ?? pendingCardPreview;
    if (preview) setPendingImage(preview);
  };

  const handleSelectLocalFile = (file: File, previewUrl: string) => {
    if (imageFolder === "banners") {
      clearStagedFeatured();
      setStagedFeaturedFile(file);
      setStagedFeaturedPreview(previewUrl);
      setPendingImage(previewUrl);
      return;
    }

    clearStagedCard();
    setStagedCardFile(file);
    setStagedCardPreview(previewUrl);
    setPendingImage(previewUrl);
  };

  const handleConfirmImage = () => {
    if (!pendingImage) return;

    if (imageFolder === "banners") {
      if (stagedFeaturedFile && stagedFeaturedPreview === pendingImage) {
        clearFeaturedLocal();
        setPendingFeaturedFile(stagedFeaturedFile);
        setPendingFeaturedPreview(stagedFeaturedPreview);
        clearStagedFeatured({ revoke: false });
        updateField("featuredImage", `local:${stagedFeaturedFile.name}`);
      } else if (
        pendingFeaturedFile &&
        pendingFeaturedPreview === pendingImage
      ) {
        updateField("featuredImage", `local:${pendingFeaturedFile.name}`);
      } else {
        clearFeaturedLocal();
        clearStagedFeatured();
        updateField("featuredImage", pendingImage);
      }
    } else if (stagedCardFile && stagedCardPreview === pendingImage) {
      clearCardLocal();
      setPendingCardFile(stagedCardFile);
      setPendingCardPreview(stagedCardPreview);
      clearStagedCard({ revoke: false });
      updateField("cardImage", `local:${stagedCardFile.name}`);
    } else if (pendingCardFile && pendingCardPreview === pendingImage) {
      updateField("cardImage", `local:${pendingCardFile.name}`);
    } else {
      clearCardLocal();
      clearStagedCard();
      updateField("cardImage", pendingImage);
    }

    setIsImageModalOpen(false);
  };

  const handleCloseImageModal = () => {
    if (imageFolder === "banners") {
      clearStagedFeatured();
    } else {
      clearStagedCard();
    }
    setIsImageModalOpen(false);
  };

  const getImageLabel = (value: string) =>
    value.split("?")[0].split("/").pop() ?? value;

  const featuredImageDisplay = pendingFeaturedFile
    ? `Archivo local: ${pendingFeaturedFile.name}`
    : values.featuredImage
      ? getImageLabel(String(values.featuredImage))
      : "";

  const cardImageDisplay = pendingCardFile
    ? `Archivo local: ${pendingCardFile.name}`
    : values.cardImage
      ? getImageLabel(String(values.cardImage))
      : "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = CreateEventSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof EventSubmitValues | undefined;
        if (!field) return;
        nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    try {
      showLoading("Subiendo imagenes...");
      setIsUploadingImages(true);
      setUploadError(null);

      let featuredImage = parsed.data.featuredImage;
      let cardImage = parsed.data.cardImage;

      if (pendingFeaturedFile) {
        const formData = new FormData();
        formData.append("section", "event-banners");
        formData.append("file", pendingFeaturedFile);
        const response = await uploadMediaImageAction(formData);
        featuredImage = response.pathname;
        clearFeaturedLocal();
        updateField("featuredImage", featuredImage);
      }

      if (pendingCardFile) {
        const formData = new FormData();
        formData.append("section", "event-cards");
        formData.append("file", pendingCardFile);
        const response = await uploadMediaImageAction(formData);
        cardImage = response.pathname;
        clearCardLocal();
        updateField("cardImage", cardImage);
      }

      onSubmit({
        ...parsed.data,
        featuredImage,
        cardImage,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error subiendo imagenes";
      setUploadError(message);
      showToast(message, "error");
    } finally {
      setIsUploadingImages(false);
      hideLoading();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-tournament-dark-accent bg-white p-5 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <FormField label="Titulo" htmlFor="event-title" error={errors.title}>
          <input
            id="event-title"
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
            className={inputClassName}
            maxLength={120}
            placeholder="Ej: Souls Master Circuit"
          />
        </FormField>

        <FormField
          label="Subtitulo"
          htmlFor="event-subtitle"
          error={errors.subtitle}
        >
          <input
            id="event-subtitle"
            value={values.subtitle}
            onChange={(event) => updateField("subtitle", event.target.value)}
            className={inputClassName}
            maxLength={160}
            placeholder="Ej: Circuito competitivo"
          />
        </FormField>
      </div>

      <FormField
        label="Resumen corto"
        htmlFor="event-summary"
        error={errors.shortSummary}
      >
        <textarea
          id="event-summary"
          value={values.shortSummary}
          onChange={(event) => updateField("shortSummary", event.target.value)}
          className={`${inputClassName} min-h-24 resize-y`}
          maxLength={300}
          placeholder="Resumen para tarjetas y listados."
        />
      </FormField>

      <div className="grid gap-5 lg:grid-cols-2">
        <FormField
          label="Imagen destacada"
          htmlFor="event-featured-image"
          error={errors.featuredImage}
        >
          <div className="flex flex-wrap gap-2">
            <input
              id="event-featured-image"
              value={featuredImageDisplay}
              readOnly
              onClick={() => handleOpenImageModal("banners")}
              className={`${inputClassName} cursor-pointer`}
              placeholder="Selecciona una imagen"
            />
            <button
              type="button"
              onClick={() => handleOpenImageModal("banners")}
              className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
            >
              Seleccionar
            </button>
          </div>
        </FormField>

        <FormField
          label="Imagen de tarjeta"
          htmlFor="event-card-image"
          error={errors.cardImage}
        >
          <div className="flex flex-wrap gap-2">
            <input
              id="event-card-image"
              value={cardImageDisplay}
              readOnly
              onClick={() => handleOpenImageModal("cards")}
              className={`${inputClassName} cursor-pointer`}
              placeholder="Selecciona una imagen"
            />
            <button
              type="button"
              onClick={() => handleOpenImageModal("cards")}
              className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
            >
              Seleccionar
            </button>
          </div>
        </FormField>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <FormField label="Inicio" htmlFor="event-starts-at" error={errors.startsAt}>
          <input
            id="event-starts-at"
            type="datetime-local"
            value={String(values.startsAt)}
            onChange={(event) => updateField("startsAt", event.target.value)}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Cierre" htmlFor="event-ends-at" error={errors.endsAt}>
          <input
            id="event-ends-at"
            type="datetime-local"
            value={values.endsAt ? String(values.endsAt) : ""}
            onChange={(event) =>
              updateField("endsAt", event.target.value || null)
            }
            className={inputClassName}
          />
        </FormField>

        <FormField label="Estado" htmlFor="event-status" error={errors.status}>
          <select
            id="event-status"
            value={values.status}
            onChange={(event) =>
              updateField("status", event.target.value as EventStatus)
            }
            className={inputClassName}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Etiqueta"
          htmlFor="event-badge-label"
          error={errors.badgeLabel}
        >
          <input
            id="event-badge-label"
            value={values.badgeLabel ?? ""}
            onChange={(event) => updateField("badgeLabel", event.target.value)}
            className={inputClassName}
            maxLength={40}
            placeholder="Ej: Premier"
          />
        </FormField>

        <FormField label="Tienda" htmlFor="event-store" error={errors.storeId}>
          <select
            id="event-store"
            value={values.storeId ?? ""}
            onChange={(event) =>
              updateField("storeId", event.target.value || null)
            }
            className={inputClassName}
          >
            <option value="">Sin tienda asociada</option>
            {storeOptions.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <MarkdownEditor
        label="Contenido"
        value={values.content}
        onChange={(value) => updateField("content", value)}
        placeholder="Contenido publico del evento"
        error={errors.content}
        enableCardInsert={false}
        enableDeckInsert={false}
        enableProductInsert={false}
        enableCustomBlocks={false}
      />

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-tournament-dark-border sm:flex-row sm:justify-between">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
          >
            Eliminar evento
          </button>
        ) : (
          <span />
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/eventos"
            className="rounded-lg border border-tournament-dark-accent px-4 py-2 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isUploadingImages}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            {submitLabel}
          </button>
        </div>
      </div>

      {uploadError && (
        <p className="text-sm text-red-500 dark:text-red-300">
          {uploadError}
        </p>
      )}

      <NewsImageModal
        isOpen={isImageModalOpen}
        images={
          imageFolder === "banners"
            ? imageOptionsState.banners
            : imageOptionsState.cards
        }
        selectedImage={pendingImage}
        onSelect={handleSelectImage}
        onSelectFile={handleSelectLocalFile}
        onSelectLocalPreview={handleSelectLocalPreview}
        localPreview={
          imageFolder === "banners"
            ? stagedFeaturedPreview && stagedFeaturedFile
              ? { url: stagedFeaturedPreview, name: stagedFeaturedFile.name }
              : pendingFeaturedPreview && pendingFeaturedFile
                ? { url: pendingFeaturedPreview, name: pendingFeaturedFile.name }
                : null
            : stagedCardPreview && stagedCardFile
              ? { url: stagedCardPreview, name: stagedCardFile.name }
              : pendingCardPreview && pendingCardFile
                ? { url: pendingCardPreview, name: pendingCardFile.name }
                : null
        }
        onClose={handleCloseImageModal}
        onConfirm={handleConfirmImage}
        folder={imageFolder}
        title={
          imageFolder === "banners"
            ? "Seleccionar imagen destacada"
            : "Seleccionar imagen para tarjeta"
        }
        description={
          imageFolder === "banners"
            ? "Selecciona una imagen tipo banner para el evento."
            : "Selecciona una imagen para la tarjeta del calendario."
        }
      />
    </form>
  );
};
