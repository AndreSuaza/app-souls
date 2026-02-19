"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { FiX } from "react-icons/fi";
import { MarkdownEditor } from "@/components";
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/ui/form";
import type { NewsCategoryOption, NewsDetail, NewsStatus } from "@/interfaces";
import { NewsImageModal } from "./NewsImageModal";

type NewsFormValues = {
  title: string;
  subtitle: string;
  shortSummary: string;
  content: string;
  featuredImage: string;
  status: NewsStatus;
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
  status: NewsStatus;
  publishedAt?: string;
  newCategoryId: string;
  tags: string[];
};

type Props = {
  categories: NewsCategoryOption[];
  imageOptions: string[];
  initialValues?: Partial<NewsDetail>;
  userId?: string;
  submitLabel?: string;
  onSubmit: (values: NewsSubmitValues) => void;
  onDelete?: () => void;
};

const SHORT_SUMMARY_MAX = 300;

const formatDateForInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

export const NewsForm = ({
  categories,
  imageOptions,
  initialValues,
  userId,
  submitLabel = "Guardar",
  onSubmit,
  onDelete,
}: Props) => {
  const defaultValues = useMemo<NewsFormValues>(
    () => ({
      title: initialValues?.title ?? "",
      subtitle: initialValues?.subtitle ?? "",
      shortSummary: initialValues?.shortSummary ?? "",
      content: initialValues?.content ?? "",
      featuredImage: initialValues?.featuredImage ?? "",
      status: initialValues?.status ?? "draft",
      publishedAt: formatDateForInput(initialValues?.publishedAt),
      newCategoryId: initialValues?.newCategoryId ?? "",
      tagsInput: initialValues?.tags?.join(", ") ?? "",
    }),
    [initialValues],
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

  const status = watch("status");
  const shortSummaryValue = watch("shortSummary") ?? "";
  const featuredImageValue = watch("featuredImage") ?? "";
  const isSubmitAttempted = Object.keys(errors).length > 0;

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);

  useEffect(() => {
    setTags(initialValues?.tags ?? []);
  }, [initialValues?.tags]);

  useEffect(() => {
    if (!isSubmitAttempted) return;
    // Re-valida para que los bordes se sincronicen con el estado de errores.
    trigger([
      "title",
      "subtitle",
      "shortSummary",
      "featuredImage",
      "newCategoryId",
      "status",
      "publishedAt",
    ]);
  }, [isSubmitAttempted, trigger]);

  const handleOpenImageModal = () => {
    setPendingImage(featuredImageValue || null);
    setIsImageModalOpen(true);
  };

  const handleConfirmImage = () => {
    if (!pendingImage) return;
    setValue("featuredImage", pendingImage, { shouldValidate: true });
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
      const merged = [...prev];
      incoming.forEach((tag) => {
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
    const currentStatus = watch("status");
    const currentPublishedAt = watch("publishedAt");

    const emptyTitle = !currentTitle?.trim();
    const emptySubtitle = !currentSubtitle?.trim();
    const emptySummary = !currentSummary?.trim();
    const emptyCategory = !currentCategory?.trim();
    const emptyFeaturedImage = !currentImage?.trim();
    const requiresPublishedAt =
      currentStatus !== "draft" && !currentPublishedAt;

    if (emptyTitle) {
      setValue("title", currentTitle, { shouldValidate: true });
    }
    if (emptySubtitle) {
      setValue("subtitle", currentSubtitle, { shouldValidate: true });
    }
    if (emptySummary) {
      setValue("shortSummary", currentSummary, { shouldValidate: true });
    }
    if (emptyCategory) {
      setValue("newCategoryId", currentCategory, { shouldValidate: true });
    }
    if (emptyFeaturedImage) {
      setValue("featuredImage", currentImage, { shouldValidate: true });
    }
    if (requiresPublishedAt) {
      setValue("publishedAt", currentPublishedAt, { shouldValidate: true });
    }
  };

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit({
      title: values.title,
      subtitle: values.subtitle,
      shortSummary: values.shortSummary,
      content: values.content,
      featuredImage: values.featuredImage,
      status: values.status,
      publishedAt: values.publishedAt ? values.publishedAt : undefined,
      newCategoryId: values.newCategoryId,
      tags,
    });
  }, handleInvalidSubmit);

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
            {...register("shortSummary", {
              required: "El resumen es obligatorio",
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
              value={featuredImageValue}
              onClick={handleOpenImageModal}
              {...register("featuredImage", {
                required: "La imagen destacada es obligatoria",
              })}
            />
            <button
              type="button"
              onClick={handleOpenImageModal}
              className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
            >
              Seleccionar
            </button>
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

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Estado"
          labelFor="news-status"
          error={errors.status?.message}
        >
          <FormSelect
            id="news-status"
            hasError={!!errors.status}
            {...register("status", { required: true })}
          >
            <option value="draft">Borrador</option>
            <option value="scheduled">Programado</option>
            <option value="published">Publicado</option>
          </FormSelect>
        </FormField>

        <FormField
          label="Fecha de publicación"
          labelFor="news-published-at"
          error={errors.publishedAt?.message}
        >
          <FormInput
            id="news-published-at"
            type="datetime-local"
            hasError={!!errors.publishedAt}
            {...register("publishedAt", {
              validate: (value) => {
                if (status !== "draft" && !value) {
                  return "La fecha de publicación es obligatoria";
                }
                return true;
              },
            })}
          />
        </FormField>
      </div>

      <FormField label="Etiquetas" labelFor="news-tags-input">
        <div className="space-y-2">
          <FormInput
            id="news-tags-input"
            placeholder="Escribe una etiqueta y presiona Enter"
            value={tagInput}
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
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-purple-500 transition hover:text-purple-700 dark:text-purple-200 dark:hover:text-white"
                  aria-label={`Eliminar ${tag}`}
                >
                  <FiX className="h-3 w-3" />
                </button>
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

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/admin/noticias"
          className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          {submitLabel}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center justify-center rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-500/10"
          >
            Eliminar noticia
          </button>
        )}
      </div>

      <NewsImageModal
        isOpen={isImageModalOpen}
        images={imageOptions}
        selectedImage={pendingImage}
        onSelect={setPendingImage}
        onClose={() => setIsImageModalOpen(false)}
        onConfirm={handleConfirmImage}
      />
    </form>
  );
};
