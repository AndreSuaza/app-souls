"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store";

export default function AdminTournamentsPage() {
  const hideLoading = useUIStore((s) => s.hideLoading);

  useEffect(() => {
    hideLoading();
  }, [hideLoading]);

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

      {/* Contenido principal */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6">
        <p className="text-gray-600">
          Aquí se mostrarán los torneos disponibles para administrar.
        </p>

        <p className="mt-2 text-sm text-gray-400">(Vista en construcción)</p>
      </div>
    </section>
  );
}
