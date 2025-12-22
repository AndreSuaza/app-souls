"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store";
import { AdminTournamentsList } from "@/components";
import { getAdminTournamentsAction } from "@/actions";
import type { AdminTournamentListItem } from "@/actions/tournaments/get-admin-tournaments.action";

export default function AdminTournamentsPage() {
  const hideLoading = useUIStore((s) => s.hideLoading);
  const [tournaments, setTournaments] = useState<AdminTournamentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hideLoading();
  }, [hideLoading]);

  useEffect(() => {
    let active = true;

    const loadTournaments = async () => {
      try {
        const data = await getAdminTournamentsAction();
        if (active) {
          setTournaments(data);
        }
      } catch {
        if (active) {
          setError("No se pudieron cargar los torneos");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTournaments();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      {/* Título de la sección */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Administración de torneos
        </h1>
        <p className="text-sm text-gray-500">
          Gestiona y administra los torneos creados desde tu tienda.
        </p>
      </header>
      {loading && (
        <div className="rounded-xl border border-gray-300 bg-white p-6 text-sm text-gray-500">
          Cargando torneos...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && <AdminTournamentsList tournaments={tournaments} />}
    </section>
  );
}
