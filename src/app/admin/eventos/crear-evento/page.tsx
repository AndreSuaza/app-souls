"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/actions/events/create-event.action";
import { getEventImagesAction } from "@/actions/events/get-event-images.action";
import { getStoreOptionsAction } from "@/actions/stores/get-store-options.action";
import {
  EventForm,
  type EventSubmitValues,
} from "@/components/events/form/EventForm";
import type { EventImageOptions } from "@/interfaces/events.interface";
import type { StoreOption } from "@/interfaces/store.interface";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";

export default function CreateEventPage() {
  const router = useRouter();
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [eventImages, setEventImages] = useState<EventImageOptions>({
    banners: [],
    cards: [],
  });
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>([]);

  useEffect(() => {
    let active = true;

    const loadImages = async () => {
      try {
        showLoading("Cargando imagenes...");
        const [images, stores] = await Promise.all([
          getEventImagesAction(),
          getStoreOptionsAction(),
        ]);
        if (active) {
          setEventImages(images);
          setStoreOptions(stores);
        }
      } catch {
        showToast("No se pudieron cargar las imagenes", "error");
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

  const handleSubmit = (values: EventSubmitValues) => {
    openConfirmation({
      text: "¿Deseas crear este evento?",
      action: async () => {
        try {
          showLoading("Creando evento...");
          await createEventAction(values);
          hideLoading();
          router.push("/admin/eventos");
          return true;
        } catch (error) {
          hideLoading();
          const message =
            error instanceof Error ? error.message : "No se pudo crear el evento";
          showToast(message, "error");
          return false;
        }
      },
      onSuccess: () => {
        showToast("Evento creado correctamente", "success");
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
          Crear evento
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Completa la información para publicar un nuevo evento del calendario.
        </p>
      </header>

      <EventForm
        imageOptions={eventImages}
        storeOptions={storeOptions}
        submitLabel="Crear evento"
        onSubmit={handleSubmit}
      />
    </section>
  );
}
