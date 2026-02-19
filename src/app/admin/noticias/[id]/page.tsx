"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  deleteNewsAction,
  getNewsByIdAction,
  getNewsCategoriesAction,
  getNewsImagesAction,
  updateNewsAction,
} from "@/actions";
import { NewsForm, type NewsSubmitValues } from "@/components";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import type { NewsCategoryOption, NewsDetail } from "@/interfaces";

export default function EditNewsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [categories, setCategories] = useState<NewsCategoryOption[]>([]);
  const [newsImages, setNewsImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        showLoading("Cargando noticia...");
        const [detail, categoryList, images] = await Promise.all([
          getNewsByIdAction(id),
          getNewsCategoriesAction(),
          getNewsImagesAction(),
        ]);

        if (!detail) {
          if (active) {
            setError("not-found");
          }
          return;
        }

        if (active) {
          setNews(detail);
          setCategories(categoryList);
          setNewsImages(images);
        }
      } catch {
        if (active) {
          setError("error");
        }
      } finally {
        if (active) {
          setLoading(false);
          hideLoading();
        }
      }
    };

    loadData();

    return () => {
      active = false;
      hideLoading();
    };
  }, [id, showLoading, hideLoading]);

  if (!loading && error === "not-found") {
    notFound();
  }

  const handleSubmit = (values: NewsSubmitValues) => {
    openConfirmation({
      text: "¿Deseas guardar los cambios?",
      action: async () => {
        showLoading("Actualizando noticia...");
        await updateNewsAction({
          newsId: id,
          ...values,
        });
        hideLoading();
        return true;
      },
      onSuccess: () => {
        showToast("Noticia actualizada", "success");
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo actualizar la noticia", "error");
      },
    });
  };

  const handleDelete = () => {
    openConfirmation({
      text: "¿Deseas eliminar esta noticia?",
      description: "Esta acción no se puede deshacer.",
      action: async () => {
        showLoading("Eliminando noticia...");
        await deleteNewsAction(id);
        hideLoading();
        router.push("/admin/noticias");
        return true;
      },
      onSuccess: () => {
        showToast("Noticia eliminada", "success");
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo eliminar la noticia", "error");
      },
    });
  };

  if (!loading && error === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
        No se pudo cargar la noticia
      </div>
    );
  }

  if (loading || !news) return null;

  const publishedAt = news.publishedAt ? new Date(news.publishedAt) : null;
  const isPublished =
    news.status === "published" ||
    (!!publishedAt && publishedAt.getTime() <= Date.now());

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Editar noticia
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Actualiza el contenido de la noticia seleccionada.
        </p>
      </header>

      <NewsForm
        categories={categories}
        imageOptions={newsImages}
        initialValues={news}
        userId={news.authorName ?? news.userId}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        readOnly={isPublished}
      />
    </section>
  );
}
