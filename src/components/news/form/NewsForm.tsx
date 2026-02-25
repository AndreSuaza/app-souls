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

  const handleOpenImageModal = (folder: "banners" | "cards") => {
    setImageFolder(folder);
    setPendingImage(
      folder === "banners" ? featuredImageValue || null : cardImageValue || null,
    );
    setIsImageModalOpen(true);
  };

  const handleConfirmImage = () => {
    if (!pendingImage) return;
    if (imageFolder === "banners") {
      setValue("featuredImage", pendingImage, { shouldValidate: true });
    } else {
      setValue("cardImage", pendingImage, { shouldValidate: true });
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

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit({
      title: values.title,
      subtitle: values.subtitle,
      shortSummary: values.shortSummary,
      content: values.content,
      featuredImage: values.featuredImage,
      cardImage: values.cardImage,
      publishedAt: values.publishedAt ? values.publishedAt : undefined,
      newCategoryId: values.newCategoryId,
      tags,
      publishNow,
    });
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
              value={featuredImageValue}
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
              value={cardImageValue}
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
              className="inline-flex h-10 items-center justify-center rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>

      <NewsImageModal
        isOpen={isImageModalOpen}
        images={
          imageFolder === "banners"
            ? imageOptions.banners
            : imageOptions.cards
        }
        selectedImage={pendingImage}
        onSelect={setPendingImage}
        onClose={() => setIsImageModalOpen(false)}
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
