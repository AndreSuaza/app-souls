"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import clsx from "clsx";
import { deleteEventAction } from "@/actions/events/delete-event.action";
import { getEventByIdAction } from "@/actions/events/get-event-by-id.action";
import { getEventImagesAction } from "@/actions/events/get-event-images.action";
import { updateEventAction } from "@/actions/events/update-event.action";
import {
  EventForm,
  type EventSubmitValues,
} from "@/components/events/form/EventForm";
import type {
  EventDetail,
  EventImageOptions,
  EventStatus,
} from "@/interfaces/events.interface";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";

const STATUS_STYLES: Record<EventStatus, { label: string; className: string }> =
  {
    draft: {
      label: "Borrador",
      className:
        "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-tournament-dark-muted dark:text-slate-300 dark:ring-tournament-dark-border",
    },
    scheduled: {
      label: "Programado",
      className:
        "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-500/30",
    },
    published: {
      label: "Publicado",
      className:
        "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-500/30",
    },
    deleted: {
      label: "Eliminado",
      className:
        "bg-red-50 text-red-600 ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-500/30",
    },
  };

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [eventImages, setEventImages] = useState<EventImageOptions>({
    banners: [],
    cards: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        showLoading("Cargando evento...");
        const [detail, images] = await Promise.all([
          getEventByIdAction(id),
          getEventImagesAction(),
        ]);

        if (!detail) {
          if (active) {
            setError("not-found");
          }
          return;
        }

        if (active) {
          setEvent(detail);
          setEventImages(images);
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

  const handleSubmit = (values: EventSubmitValues) => {
    if (!event) return;

    openConfirmation({
      text: "¿Deseas guardar los cambios?",
      action: async () => {
        try {
          showLoading("Actualizando evento...");
          await updateEventAction({
            eventId: event.id,
            ...values,
          });
          hideLoading();
          return true;
        } catch (error) {
          hideLoading();
          const message =
            error instanceof Error
              ? error.message
              : "No se pudo actualizar el evento";
          showToast(message, "error");
          return false;
        }
      },
      onSuccess: () => {
        showToast("Evento actualizado", "success");
      },
      onError: () => {
        hideLoading();
      },
    });
  };

  const handleDelete = () => {
    if (!event) return;

    openConfirmation({
      text: "¿Deseas eliminar este evento?",
      description: "Esta acción no se puede deshacer.",
      action: async () => {
        showLoading("Eliminando evento...");
        await deleteEventAction(event.id);
        hideLoading();
        router.push("/admin/eventos");
        return true;
      },
      onSuccess: () => {
        showToast("Evento eliminado", "success");
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo eliminar el evento", "error");
      },
    });
  };

  if (!loading && error === "error") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
        No se pudo cargar el evento
      </div>
    );
  }

  if (loading || !event) return null;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Editar evento
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Actualiza el contenido del evento seleccionado.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          Estado:
        </span>
        <span
          className={clsx(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
            STATUS_STYLES[event.status].className,
          )}
        >
          {STATUS_STYLES[event.status].label}
        </span>
      </div>

      <EventForm
        initialValues={event}
        imageOptions={eventImages}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </section>
  );
}
