"use client";

import { useEffect, useState } from "react";
import { getAdminEventsAction } from "@/actions/events/get-admin-events.action";
import { AdminEventsList } from "@/components/events/admin/AdminEventsList";
import type { AdminEventListItem } from "@/interfaces/events.interface";
import { useUIStore } from "@/store";

export default function AdminEventsPage() {
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [events, setEvents] = useState<AdminEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        showLoading("Cargando eventos...");
        const data = await getAdminEventsAction();

        if (active) {
          setEvents(data);
        }
      } catch {
        if (active) {
          setError("No se pudieron cargar los eventos");
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
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Administración de eventos
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gestiona el calendario público de eventos.
        </p>
      </header>

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <AdminEventsList events={events} onDeleted={handleDeleted} />
      )}
    </section>
  );
}
