"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useUIStore } from "@/store";
import { AdminTournamentsList } from "@/components";
import {
  getAdminTournamentsAction,
  getTournamentTypesAction,
  getStoreOptionsAction,
  type AdminTournamentListItem,
} from "@/actions";

export default function AdminTournamentsPage() {
  const showLoading = useUIStore((s) => s.showLoading);
  const hideLoading = useUIStore((s) => s.hideLoading);
  const [tournaments, setTournaments] = useState<AdminTournamentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const showStoreColumn = session?.user?.role === "admin";
  const isAdmin = showStoreColumn;
  const [tierOptions, setTierOptions] = useState<string[]>([]);
  const [storeOptions, setStoreOptions] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const loadTournaments = async () => {
      try {
        showLoading("Cargando torneos...");
        const [data, types, stores] = await Promise.all([
          getAdminTournamentsAction(),
          getTournamentTypesAction(),
          getStoreOptionsAction(),
        ]);
        if (active) {
          setTournaments(data);
          setTierOptions(
            Array.from(new Set(types.map((type) => type.name))).filter(
              (name) => name.trim().length > 0
            )
          );
          setStoreOptions(
            Array.from(new Set(stores.map((store) => store.name))).filter(
              (name) => name.trim().length > 0
            )
          );
        }
      } catch {
        if (active) {
          setError("No se pudieron cargar los torneos");
        }
      } finally {
        if (active) {
          setLoading(false);
          hideLoading();
        }
      }
    };

    loadTournaments();

    return () => {
      active = false;
      hideLoading();
    };
  }, [showLoading, hideLoading]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Administración de torneos
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Gestiona y administra los torneos creados desde tu tienda.
        </p>
      </header>
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <AdminTournamentsList
          tournaments={tournaments}
          showStoreColumn={showStoreColumn}
          isAdmin={isAdmin}
          availableTiers={tierOptions}
          availableStores={storeOptions}
        />
      )}
    </section>
  );
}
