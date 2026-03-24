"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  deleteProductAction,
  getProductByIdAction,
  getProductImagesAction,
  updateProductAction,
} from "@/actions";
import {
  ProductForm,
  type ProductSubmitValues,
} from "@/components/productos/form/ProductForm";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import type { AdminProductDetail } from "@/interfaces";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        showLoading("Cargando producto...");
        const [detail, list] = await Promise.all([
          getProductByIdAction(id),
          getProductImagesAction(),
        ]);

        if (!detail) {
          if (active) {
            setError("not-found");
          }
          return;
        }

        if (active) {
          setProduct(detail);
          setImages(list);
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

  const handleSubmit = (values: ProductSubmitValues) => {
    if (!product) return;
    openConfirmation({
      text: "¿Deseas guardar los cambios?",
      action: async () => {
        try {
          showLoading("Actualizando producto...");
          const indexValue = values.index ?? product.index;
          await updateProductAction({
            productId: product.id,
            ...values,
            index: indexValue,
          });
          hideLoading();
          return true;
        } catch (error) {
          hideLoading();
          const message =
            error instanceof Error
              ? error.message
              : "No se pudo actualizar el producto";
          showToast(message, "error");
          return false;
        }
      },
      onSuccess: () => {
        showToast("Producto actualizado", "success");
      },
      onError: () => {
        hideLoading();
      },
    });
  };

  const handleDelete = () => {
    if (!product) return;
    openConfirmation({
      text: "¿Deseas eliminar este producto?",
      description: "Esta acción no se puede deshacer.",
      action: async () => {
        showLoading("Eliminando producto...");
        await deleteProductAction(product.id);
        hideLoading();
        router.push("/admin/productos");
        return true;
      },
      onSuccess: () => {
        showToast("Producto eliminado", "success");
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo eliminar el producto", "error");
      },
    });
  };

  if (!loading && error === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
        No se pudo cargar el producto
      </div>
    );
  }

  if (loading || !product) return null;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Editar producto
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Actualiza la información del producto seleccionado.
        </p>
      </header>

      <ProductForm
        images={images}
        initialValues={product}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        cancelHref="/admin/productos"
      />
    </section>
  );
}
