"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createNewsAction,
  getNewsCategoriesAction,
  getNewsImagesAction,
} from "@/actions";
import { NewsForm, type NewsSubmitValues } from "@/components";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import type { NewsCategoryOption } from "@/interfaces";

export default function CreateNewsPage() {
  const router = useRouter();
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [categories, setCategories] = useState<NewsCategoryOption[]>([]);
  const [newsImages, setNewsImages] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      try {
        showLoading("Cargando categorías...");
        const [data, images] = await Promise.all([
          getNewsCategoriesAction(),
          getNewsImagesAction(),
        ]);
        if (active) {
          setCategories(data);
          setNewsImages(images);
        }
      } catch {
        showToast("No se pudieron cargar las categorías", "error");
      } finally {
        if (active) {
          hideLoading();
        }
      }
    };

    loadCategories();

    return () => {
      active = false;
      hideLoading();
    };
  }, [showLoading, hideLoading, showToast]);

  const handleSubmit = (values: NewsSubmitValues) => {
    openConfirmation({
      text: "¿Deseas crear esta noticia?",
      action: async () => {
        showLoading("Creando noticia...");
        const newsId = await createNewsAction(values);
        hideLoading();
        router.push(`/admin/noticias/${newsId}`);
        return true;
      },
      onSuccess: () => {
        showToast("Noticia creada correctamente", "success");
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo crear la noticia", "error");
      },
    });
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Crear noticia
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Completa la información para publicar una nueva noticia.
        </p>
      </header>

      <NewsForm
        categories={categories}
        imageOptions={newsImages}
        submitLabel="Crear noticia"
        onSubmit={handleSubmit}
      />
    </section>
  );
}
