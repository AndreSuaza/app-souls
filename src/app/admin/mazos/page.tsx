"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store";
import { AdminDecksList } from "@/components";
import { getAdminDecksAction } from "@/actions";
import type { AdminDeckListItem } from "@/interfaces";

export default function Page() {
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const [decks, setDecks] = useState<AdminDeckListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadDecks = async () => {
      try {
        showLoading("Cargando mazos...");
        const data = await getAdminDecksAction();
        if (active) {
          setDecks(data);
        }
      } catch {
        if (active) {
          setError("No se pudieron cargar los mazos");
        }
      } finally {
        if (active) {
          setLoading(false);
          hideLoading();
        }
      }
    };

    loadDecks();

    return () => {
      active = false;
      hideLoading();
    };
  }, [showLoading, hideLoading]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Mazos estructurados
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Administra los mazos creados desde el panel de administración.
        </p>
      </header>

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <AdminDecksList
          decks={decks}
          onDeleted={(id) =>
            setDecks((prev) => prev.filter((deck) => deck.id !== id))
          }
        />
      )}
    </section>
  );
}
