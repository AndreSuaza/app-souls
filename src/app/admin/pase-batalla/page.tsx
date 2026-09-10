import { Suspense } from "react";
import { AdminBattlePassManager } from "@/components/battle-pass/admin/AdminBattlePassManager";

export default function AdminBattlePassPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-tournament-dark-accent bg-white p-6 text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
          Cargando pase de batalla...
        </div>
      }
    >
      <AdminBattlePassManager />
    </Suspense>
  );
}
