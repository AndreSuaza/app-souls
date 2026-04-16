import Link from "next/link";
import { AdminResetEloCard } from "@/components/admin/AdminResetEloCard";

export default function Page() {
  return (
    <div className="min-h-screen space-y-6">
      <div className="flex flex-col gap-2 rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Administrador
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Panel base para gestionar el sistema. Aqui estan las secciones
          principales y las acciones criticas del admin.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Accesos rapidos
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Accede a las secciones principales del panel.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href="/admin/torneos"
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:text-purple-300"
              >
                Torneos
              </Link>
              <Link
                href="/admin/noticias"
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:text-purple-300"
              >
                Noticias
              </Link>
              <Link
                href="/admin/productos"
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:text-purple-300"
              >
                Productos
              </Link>
              <Link
                href="/admin/medios"
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:text-purple-300"
              >
                Medios
              </Link>
              <Link
                href="/admin/mazos"
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:text-purple-300"
              >
                Mazos
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <AdminResetEloCard />
        </div>
      </div>
    </div>
  );
}
