"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { MarkdownEditor } from "@/components";
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/ui/form";
import type { NewsCategoryOption, NewsDetail, NewsStatus } from "@/interfaces";

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
  initialValues?: Partial<NewsDetail>;
  userId?: string;
  submitLabel?: string;
  onSubmit: (values: NewsSubmitValues) => void;
  onDelete?: () => void;
};

const formatDateForInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

export const NewsForm = ({
  categories,
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
  } = useForm<NewsFormValues>({
    defaultValues,
  });

  const status = watch("status");

  const handleFormSubmit = handleSubmit((values) => {
    const tags = values.tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

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
  });

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
        <FormTextarea
          id="news-summary"
          rows={3}
          placeholder="Resumen breve para listados"
          hasError={!!errors.shortSummary}
          {...register("shortSummary", {
            required: "El resumen es obligatorio",
          })}
        />
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
          <FormInput
            id="news-featured-image"
            placeholder="URL o ruta de la imagen"
            hasError={!!errors.featuredImage}
            {...register("featuredImage", {
              required: "La imagen destacada es obligatoria",
            })}
          />
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
        <FormField label="Estado" labelFor="news-status">
          <FormSelect
            id="news-status"
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

      <FormField label="Etiquetas (separadas por coma)" labelFor="news-tags">
        <FormInput
          id="news-tags"
          placeholder="meta, competitivo, eventos"
          {...register("tagsInput")}
        />
      </FormField>

      {userId && (
        <div className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500 dark:border-tournament-dark-border dark:text-slate-300">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            Autor:
          </span>{" "}
          {userId}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
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
    </form>
  );
};
