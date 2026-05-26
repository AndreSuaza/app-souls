import { Suspense } from "react";
import { AdminUsersManager } from "@/components/users/admin/AdminUsersManager";

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-tournament-dark-accent bg-white p-6 text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
          Cargando administracion de usuarios...
        </div>
      }
    >
      <AdminUsersManager />
    </Suspense>
  );
}
