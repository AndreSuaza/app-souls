"use client";

import { useEffect, useState } from "react";
import { AdminNewsList } from "@/components";
import { getAdminNewsAction, getNewsCategoriesAction } from "@/actions";
import { useUIStore } from "@/store";
import type { AdminNewsListItem, NewsCategoryOption } from "@/interfaces";

export default function AdminNewsPage() {
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [news, setNews] = useState<AdminNewsListItem[]>([]);
  const [categories, setCategories] = useState<NewsCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        showLoading("Cargando noticias...");
        const [newsList, categoryList] = await Promise.all([
          getAdminNewsAction(),
          getNewsCategoriesAction(),
        ]);

        if (active) {
          setNews(newsList);
          setCategories(categoryList);
        }
      } catch {
        if (active) {
          setError("No se pudieron cargar las noticias");
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
  }, [showLoading, hideLoading]);

  const handleDeleted = (id: string) => {
    setNews((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Administración de noticias
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gestiona las noticias publicadas en la plataforma.
        </p>
      </header>

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <AdminNewsList
          news={news}
          categories={categories}
          onDeleted={handleDeleted}
        />
      )}
    </section>
  );
}
