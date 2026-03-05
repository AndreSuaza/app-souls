"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, getProductImagesAction } from "@/actions";
import {
  ProductForm,
  type ProductSubmitValues,
} from "@/components/productos/form/ProductForm";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";

export default function CreateProductPage() {
  const router = useRouter();
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const loadImages = async () => {
      try {
        showLoading("Cargando imágenes...");
        const list = await getProductImagesAction();
        if (active) {
          setImages(list);
        }
      } catch {
        showToast("No se pudieron cargar las imágenes", "error");
      } finally {
        if (active) {
          hideLoading();
        }
      }
    };

    loadImages();

    return () => {
      active = false;
      hideLoading();
    };
  }, [showLoading, hideLoading, showToast]);

  const handleSubmit = (values: ProductSubmitValues) => {
    openConfirmation({
      text: "¿Deseas crear este producto?",
      action: async () => {
        try {
          showLoading("Creando producto...");
          const productId = await createProductAction(values);
          hideLoading();
          router.push(`/admin/productos/${productId}`);
          return true;
        } catch (error) {
          hideLoading();
          const message =
            error instanceof Error
              ? error.message
              : "No se pudo crear el producto";
          showToast(message, "error");
          return false;
        }
      },
      onSuccess: () => {
        showToast("Producto creado correctamente", "success");
      },
      onError: () => {
        hideLoading();
      },
    });
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Crear producto
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Completa la información para publicar un nuevo producto.
        </p>
      </header>

      <ProductForm
        images={images}
        submitLabel="Crear producto"
        onSubmit={handleSubmit}
        cancelHref="/admin/productos"
      />
    </section>
  );
}
