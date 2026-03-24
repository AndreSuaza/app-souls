"use client";

import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import { FiX } from "react-icons/fi";
import { MarkdownEditor } from "@/components";
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/ui/form";
import type {
  NewsCategoryOption,
  NewsDetail,
  NewsImageOptions,
} from "@/interfaces";
import { NewsImageModal } from "./NewsImageModal";
import { uploadNewsImageAction } from "@/actions/news/upload-news-image.action";
import { useToastStore } from "@/store";
import { useUIStore } from "@/store";
import { toBlobPath } from "@/utils/blob-path";

type NewsFormValues = {
  title: string;
  subtitle: string;
  shortSummary: string;
  content: string;
  featuredImage: string;
  cardImage: string;
  publishedAt: string;
  newCategoryId: string;
  tagsInput: string;
};

export type NewsSubmitValues = {
  title: string;
  subtitle: string;
  shortSummary: string;
  content: string;
  featuredImage: string;
  cardImage: string;
  publishedAt?: string;
  newCategoryId: string;
  tags: string[];
  publishNow: boolean;
};

type Props = {
  categories: NewsCategoryOption[];
  imageOptions: NewsImageOptions;
  initialValues?: Partial<NewsDetail>;
  userId?: string;
  submitLabel?: string;
  onSubmit: (values: NewsSubmitValues) => void;
  onDelete?: () => void;
  readOnly?: boolean;
};

const SHORT_SUMMARY_MAX = 300;

const formatDateForInput = (value?: string | Date | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  // Ajusta a hora local para que el input muestre la fecha del usuario.
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export const NewsForm = ({
  categories,
  imageOptions,
  initialValues,
  userId,
  submitLabel = "Guardar",
  onSubmit,
  onDelete,
  readOnly = false,
}: Props) => {
  const defaultValues = useMemo<NewsFormValues>(
    () => ({
      title: initialValues?.title ?? "",
      subtitle: initialValues?.subtitle ?? "",
      shortSummary: initialValues?.shortSummary ?? "",
      content: initialValues?.content ?? "",
      featuredImage: initialValues?.featuredImage ?? "",
      cardImage: initialValues?.cardImage ?? "",
      publishedAt: formatDateForInput(initialValues?.publishedAt),
      newCategoryId: initialValues?.newCategoryId ?? "",
      tagsInput: initialValues?.tags?.join(", ") ?? "",
    }),
    [initialValues],
  );
  const minPublishedAt = useMemo(() => formatDateForInput(new Date()), []);
  const initialPublishedAt = useMemo(
    () => formatDateForInput(initialValues?.publishedAt),
    [initialValues?.publishedAt],
  );
  const showToast = useToastStore((s) => s.showToast);
  const { showLoading, hideLoading } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    trigger,
  } = useForm<NewsFormValues>({
    defaultValues,
  });

  const shortSummaryValue = watch("shortSummary") ?? "";
  const featuredImageValue = watch("featuredImage") ?? "";
  const cardImageValue = watch("cardImage") ?? "";
  const isSubmitAttempted = Object.keys(errors).length > 0;

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [imageFolder, setImageFolder] = useState<"banners" | "cards">(
    "banners",
  );
  const [imageOptionsState, setImageOptionsState] =
    useState<NewsImageOptions>(imageOptions);
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
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [publishNow, setPublishNow] = useState(false);
  const [hasPublishedAtChanged, setHasPublishedAtChanged] = useState(false);

  const effectiveMinPublishedAt = useMemo(() => {
    if (readOnly) return undefined;
    // Si está publicada y no se modificó la fecha, no imponemos mínimo.
    if (initialValues?.status === "published" && !hasPublishedAtChanged) {
      return undefined;
    }
    return minPublishedAt;
  }, [
    readOnly,
    initialValues?.status,
    hasPublishedAtChanged,
    minPublishedAt,
  ]);

  useEffect(() => {
    setTags((initialValues?.tags ?? []).slice(0, 5));
  }, [initialValues?.tags]);

  useEffect(() => {
    setHasPublishedAtChanged(false);
  }, [initialPublishedAt]);

  useEffect(() => {
    setImageOptionsState(imageOptions);
  }, [imageOptions]);

  useEffect(() => {
    return () => {
      if (pendingFeaturedPreview) {
        URL.revokeObjectURL(pendingFeaturedPreview);
      }
      if (pendingCardPreview) {
        URL.revokeObjectURL(pendingCardPreview);
      }
      if (stagedFeaturedPreview) {
        URL.revokeObjectURL(stagedFeaturedPreview);
      }
      if (stagedCardPreview) {
        URL.revokeObjectURL(stagedCardPreview);
      }
    };
  }, [
    pendingFeaturedPreview,
    pendingCardPreview,
    stagedFeaturedPreview,
    stagedCardPreview,
  ]);

  useEffect(() => {
    if (!isSubmitAttempted) return;
    // Re-valida para que los bordes se sincronicen con el estado de errores.
    trigger([
      "title",
      "subtitle",
      "shortSummary",
      "featuredImage",
      "cardImage",
      "newCategoryId",
    ]);
  }, [isSubmitAttempted, trigger]);

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

  const clearStagedFeatured = () => {
    setStagedFeaturedFile(null);
    setStagedFeaturedPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const clearStagedCard = () => {
    setStagedCardFile(null);
    setStagedCardPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handleOpenImageModal = (folder: "banners" | "cards") => {
    setImageFolder(folder);
    if (folder === "banners") {
      const currentFeatured =
        featuredImageValue.startsWith("local:")
          ? null
          : toBlobPath(featuredImageValue);
      clearStagedFeatured();
      setPendingImage(pendingFeaturedPreview ?? currentFeatured ?? null);
    } else {
      const currentCard =
        cardImageValue.startsWith("local:")
          ? null
          : toBlobPath(cardImageValue);
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
    }
    if (imageFolder === "cards") {
      const preview = stagedCardPreview ?? pendingCardPreview;
      if (preview) setPendingImage(preview);
    }
  };

  const handleSelectLocalFile = (file: File, previewUrl: string) => {
    if (imageFolder === "banners") {
      clearStagedFeatured();
      setStagedFeaturedFile(file);
      setStagedFeaturedPreview(previewUrl);
      setPendingImage(previewUrl);
    } else {
      clearStagedCard();
      setStagedCardFile(file);
      setStagedCardPreview(previewUrl);
      setPendingImage(previewUrl);
    }
  };

  const getImageLabel = (value: string) =>
    value.split("?")[0].split("/").pop() ?? value;

  const featuredImageDisplay = pendingFeaturedFile
    ? `Archivo local: ${pendingFeaturedFile.name}`
    : featuredImageValue
      ? getImageLabel(featuredImageValue)
      : "";

  const cardImageDisplay = pendingCardFile
    ? `Archivo local: ${pendingCardFile.name}`
    : cardImageValue
      ? getImageLabel(cardImageValue)
      : "";

  const handleConfirmImage = () => {
    if (!pendingImage) return;
    if (imageFolder === "banners") {
      if (stagedFeaturedFile && stagedFeaturedPreview === pendingImage) {
        clearFeaturedLocal();
        setPendingFeaturedFile(stagedFeaturedFile);
        setPendingFeaturedPreview(stagedFeaturedPreview);
        clearStagedFeatured();
        setValue("featuredImage", `local:${stagedFeaturedFile.name}`, {
          shouldValidate: true,
        });
      } else if (
        pendingFeaturedFile &&
        pendingFeaturedPreview === pendingImage
      ) {
        setValue("featuredImage", `local:${pendingFeaturedFile.name}`, {
          shouldValidate: true,
        });
      } else {
        clearFeaturedLocal();
        clearStagedFeatured();
        setValue("featuredImage", pendingImage, { shouldValidate: true });
      }
    } else {
      if (stagedCardFile && stagedCardPreview === pendingImage) {
        clearCardLocal();
        setPendingCardFile(stagedCardFile);
        setPendingCardPreview(stagedCardPreview);
        clearStagedCard();
        setValue("cardImage", `local:${stagedCardFile.name}`, {
          shouldValidate: true,
        });
      } else if (pendingCardFile && pendingCardPreview === pendingImage) {
        setValue("cardImage", `local:${pendingCardFile.name}`, {
          shouldValidate: true,
        });
      } else {
        clearCardLocal();
        clearStagedCard();
        setValue("cardImage", pendingImage, { shouldValidate: true });
      }
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

  const handleAddTags = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    // Permite agregar varias etiquetas separadas por coma en un solo intento.
    const incoming = trimmed
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    setTags((prev) => {
      if (prev.length >= 5) return prev;
      const merged = [...prev];
      incoming.forEach((tag) => {
        if (merged.length >= 5) return;
        if (!merged.includes(tag)) {
          merged.push(tag);
        }
      });
      return merged;
    });
    setTagInput("");
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTags();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleInvalidSubmit = () => {
    // Forza el estado de error en campos obligatorios aunque no tengan interacción previa.
    const currentTitle = watch("title");
    const currentSubtitle = watch("subtitle");
    const currentSummary = watch("shortSummary");
    const currentCategory = watch("newCategoryId");
    const currentImage = watch("featuredImage");
    const currentCardImage = watch("cardImage");

    if (!currentTitle?.trim()) {
      setValue("title", currentTitle, { shouldValidate: true });
    }
    if (!currentSubtitle?.trim()) {
      setValue("subtitle", currentSubtitle, { shouldValidate: true });
    }
    if (!currentSummary?.trim()) {
      setValue("shortSummary", currentSummary, { shouldValidate: true });
    }
    if (!currentCategory?.trim()) {
      setValue("newCategoryId", currentCategory, { shouldValidate: true });
    }
    if (!currentImage?.trim()) {
      setValue("featuredImage", currentImage, { shouldValidate: true });
    }
    if (!currentCardImage?.trim()) {
      setValue("cardImage", currentCardImage, { shouldValidate: true });
    }
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    try {
      showLoading("Subiendo imágenes...");
      setIsUploadingImages(true);
      setUploadError(null);

      let featuredImage = values.featuredImage;
      let cardImage = values.cardImage;

      // Subimos a Blob solo cuando el usuario confirma el guardado.
      if (pendingFeaturedFile) {
        const formData = new FormData();
        formData.append("file", pendingFeaturedFile);
        formData.append("folder", "banners");
        const response = await uploadNewsImageAction(formData);
        featuredImage = response.pathname;
        clearFeaturedLocal();
        setValue("featuredImage", featuredImage, { shouldValidate: true });
      }

      if (pendingCardFile) {
        const formData = new FormData();
        formData.append("file", pendingCardFile);
        formData.append("folder", "cards");
        const response = await uploadNewsImageAction(formData);
        cardImage = response.pathname;
        clearCardLocal();
        setValue("cardImage", cardImage, { shouldValidate: true });
      }

      onSubmit({
        title: values.title,
        subtitle: values.subtitle,
        shortSummary: values.shortSummary,
        content: values.content,
        featuredImage,
        cardImage,
        publishedAt: values.publishedAt ? values.publishedAt : undefined,
        newCategoryId: values.newCategoryId,
        tags,
        publishNow,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error subiendo imágenes";
      setUploadError(message);
      showToast(message, "error");
    } finally {
      hideLoading();
      setIsUploadingImages(false);
    }
  }, handleInvalidSubmit);

  const handlePublishNow = () => {
    setPublishNow(true);
    setHasPublishedAtChanged(true);
    setValue("publishedAt", formatDateForInput(new Date()), {
      shouldValidate: true,
    });
  };

  const handlePublishedAtChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (publishNow) {
      setPublishNow(false);
    }
    const nextValue = event.target.value;
    setHasPublishedAtChanged(nextValue !== initialPublishedAt);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="rounded-xl border border-tournament-dark-accent bg-white p-6 shadow-sm space-y-5 dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          label="Título"
          labelFor="news-title"
          error={errors.title?.message}
        >
          <FormInput
            id="news-title"
            placeholder="Ej. Presentamos el nuevo arquetipo"
            hasError={!!errors.title}
            disabled={readOnly}
            {...register("title", {
              required: "El título es obligatorio",
            })}
          />
        </FormField>

        <FormField
          label="Subtítulo"
          labelFor="news-subtitle"
          error={errors.subtitle?.message}
        >
          <FormInput
            id="news-subtitle"
            placeholder="Ej. Todo lo que necesitas saber"
            hasError={!!errors.subtitle}
            disabled={readOnly}
            {...register("subtitle", {
              required: "El subtítulo es obligatorio",
            })}
          />
        </FormField>
      </div>

      <FormField
        label="Resumen corto"
        labelFor="news-summary"
        error={errors.shortSummary?.message}
      >
        <div className="relative">
          <FormTextarea
            id="news-summary"
            rows={3}
            placeholder="Resumen breve para listados"
            hasError={!!errors.shortSummary}
            className="pb-7"
            maxLength={SHORT_SUMMARY_MAX}
            disabled={readOnly}
            {...register("shortSummary", {
              required: "El resumen es obligatorio",
              minLength: {
                value: 10,
                message: "El resumen debe tener al menos 10 caracteres",
              },
            })}
          />
          <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-slate-400 dark:text-slate-500">
            {shortSummaryValue.length}/{SHORT_SUMMARY_MAX}
          </span>
        </div>
      </FormField>

      <Controller
        name="content"
        control={control}
        rules={{
          validate: (value) => {
            if (!value || value.trim().length < 10) {
              return "El contenido es obligatorio";
            }
            return true;
          },
        }}
        render={({ field }) => (
          <MarkdownEditor
            label="Contenido"
            value={field.value}
            onChange={field.onChange}
            placeholder="Escribe el contenido de la noticia..."
            error={errors.content?.message}
            readOnly={readOnly}
          />
        )}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          label="Imagen destacada"
          labelFor="news-featured-image"
          error={errors.featuredImage?.message}
        >
          <div className="flex flex-wrap gap-2">
            <FormInput
              id="news-featured-image"
              placeholder="Selecciona una imagen"
              hasError={!!errors.featuredImage}
              readOnly
              disabled={readOnly}
              value={featuredImageDisplay}
              onClick={readOnly ? undefined : () => handleOpenImageModal("banners")}
              {...register("featuredImage", {
                required: "La imagen destacada es obligatoria",
              })}
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleOpenImageModal("banners")}
                className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
              >
                Seleccionar
              </button>
            )}
          </div>
        </FormField>

        <FormField
          label="Imagen para tarjeta"
          labelFor="news-card-image"
          error={errors.cardImage?.message}
        >
          <div className="flex flex-wrap gap-2">
            <FormInput
              id="news-card-image"
              placeholder="Selecciona una imagen"
              hasError={!!errors.cardImage}
              readOnly
              disabled={readOnly}
              value={cardImageDisplay}
              onClick={readOnly ? undefined : () => handleOpenImageModal("cards")}
              {...register("cardImage", {
                required: "La imagen para tarjeta es obligatoria",
              })}
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleOpenImageModal("cards")}
                className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
              >
                Seleccionar
              </button>
            )}
          </div>
        </FormField>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField label="Fecha de publicación" labelFor="news-published-at">
          <div className="flex flex-wrap gap-2">
            <FormInput
              id="news-published-at"
              type="datetime-local"
              disabled={readOnly}
              min={effectiveMinPublishedAt}
              {...register("publishedAt", {
                onChange: handlePublishedAtChange,
              })}
            />
            {!readOnly && (
              <button
                type="button"
                onClick={handlePublishNow}
                disabled={publishNow}
                className={clsx(
                  "inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition",
                  publishNow
                    ? "border-emerald-200 bg-emerald-50 text-emerald-500 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-500/10",
                )}
              >
                Publicar ahora
              </button>
            )}
          </div>
        </FormField>

        <FormField
          label="Categoría"
          labelFor="news-category"
          error={errors.newCategoryId?.message}
        >
          <FormSelect
            id="news-category"
            hasError={!!errors.newCategoryId}
            disabled={readOnly}
            {...register("newCategoryId", {
              required: "La categoría es obligatoria",
            })}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </FormSelect>
        </FormField>
      </div>

      <FormField
        label="Etiquetas"
        labelFor="news-tags-input"
        tooltip="Máximo 5 palabras clave por noticia."
      >
        <div className="space-y-2">
          <FormInput
            id="news-tags-input"
            placeholder="Escribe una etiqueta y presiona Enter"
            value={tagInput}
            disabled={readOnly}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={handleTagKeyDown}
          />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:border-purple-400/50 dark:bg-purple-500/10 dark:text-purple-200"
              >
                {tag}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-purple-500 transition hover:text-purple-700 dark:text-purple-200 dark:hover:text-white"
                    aria-label={`Eliminar ${tag}`}
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      </FormField>

      {userId && (
        <div className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500 dark:border-tournament-dark-border dark:text-slate-300">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            Autor:
          </span>{" "}
          {userId}
        </div>
      )}

      <div
        className={clsx(
          "flex flex-wrap items-center gap-3",
          onDelete ? "justify-between" : "justify-end",
        )}
      >
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-red-500 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
          >
            Eliminar noticia
          </button>
        )}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/admin/noticias"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
          >
            Cancelar
          </Link>
          {!readOnly && (
            <button
              type="submit"
              disabled={isUploadingImages}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
            >
              {submitLabel}
            </button>
          )}
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
            ? "Selecciona una imagen tipo banner para la noticia."
            : "Selecciona una imagen cuadrada para la tarjeta."
        }
      />
    </form>
  );
};
