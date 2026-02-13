"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import { MdError } from "react-icons/md";
import { MarkdownEditor } from "@/components";
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
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Título
          </label>
          <input
            className={clsx(
              "w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500",
              {
                "border-red-500": errors.title,
              },
            )}
            placeholder="Ej. Presentamos el nuevo arquetipo"
            {...register("title", {
              required: "El tÃ­tulo es obligatorio",
            })}
          />
          {errors.title && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
              <MdError size={14} />
              <span>{errors.title.message}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Subtítulo
          </label>
          <input
            className={clsx(
              "w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500",
              {
                "border-red-500": errors.subtitle,
              },
            )}
            placeholder="Ej. Todo lo que necesitas saber"
            {...register("subtitle", {
              required: "El subtÃ­tulo es obligatorio",
            })}
          />
          {errors.subtitle && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
              <MdError size={14} />
              <span>{errors.subtitle.message}</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Resumen corto
        </label>
        <textarea
          rows={3}
          className={clsx(
            "w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500",
            {
              "border-red-500": errors.shortSummary,
            },
          )}
          placeholder="Resumen breve para listados"
          {...register("shortSummary", {
            required: "El resumen es obligatorio",
          })}
        />
        {errors.shortSummary && (
          <div className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
            <MdError size={14} />
            <span>{errors.shortSummary.message}</span>
          </div>
        )}
      </div>

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
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Imagen destacada
          </label>
          <input
            className={clsx(
              "w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500",
              {
                "border-red-500": errors.featuredImage,
              },
            )}
            placeholder="URL o ruta de la imagen"
            {...register("featuredImage", {
              required: "La imagen destacada es obligatoria",
            })}
          />
          {errors.featuredImage && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
              <MdError size={14} />
              <span>{errors.featuredImage.message}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Categoría
          </label>
          <select
            className={clsx(
              "w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30",
              {
                "border-red-500": errors.newCategoryId,
              },
            )}
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
          </select>
          {errors.newCategoryId && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
              <MdError size={14} />
              <span>{errors.newCategoryId.message}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Estado
          </label>
          <select
            className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
            {...register("status", { required: true })}
          >
            <option value="draft">Borrador</option>
            <option value="scheduled">Programado</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Fecha de publicación
          </label>
          <input
            type="datetime-local"
            className={clsx(
              "w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30",
              {
                "border-red-500": errors.publishedAt,
              },
            )}
            {...register("publishedAt", {
              validate: (value) => {
                if (status !== "draft" && !value) {
                  return "La fecha de publicaciÃ³n es obligatoria";
                }
                return true;
              },
            })}
          />
          {errors.publishedAt && (
            <div className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
              <MdError size={14} />
              <span>{errors.publishedAt.message}</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Etiquetas (separadas por coma)
        </label>
        <input
          className="w-full rounded-lg border border-tournament-dark-accent bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30"
          placeholder="meta, competitivo, eventos"
          {...register("tagsInput")}
        />
      </div>

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
