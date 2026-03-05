"use client";

import { useEffect, useState } from "react";
import { AdminProductsList } from "@/components/productos/admin/AdminProductsList";
import { getAdminProductsAction } from "@/actions";
import { useUIStore } from "@/store";
import type { AdminProductListItem } from "@/interfaces";

export default function AdminProductsPage() {
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        showLoading("Cargando productos...");
        const list = await getAdminProductsAction();
        if (active) {
          setProducts(list);
        }
      } catch {
        if (active) {
          setError("No se pudieron cargar los productos");
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
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Administración de productos
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gestiona los productos disponibles en la tienda.
        </p>
      </header>

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <AdminProductsList products={products} onDeleted={handleDeleted} />
      )}
    </section>
  );
}
