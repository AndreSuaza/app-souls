import { Suspense } from "react";
import Link from "next/link";
import { AdminUsersManager } from "@/components/users/admin/AdminUsersManager";

export default function AdminUsersPage() {
  return (
    <section className="space-y-4">
      <Link href="/admin/usuarios/dashboard" className="inline-flex rounded-lg border border-purple-400/50 px-3 py-2 text-sm font-semibold text-purple-200 transition hover:bg-purple-600/20">
        Ver dashboard de usuarios →
      </Link>
      <Suspense
        fallback={
          <div className="rounded-2xl border border-tournament-dark-accent bg-white p-6 text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
            Cargando administracion de usuarios...
          </div>
        }
      >
        <AdminUsersManager />
      </Suspense>
    </section>
  );
}
