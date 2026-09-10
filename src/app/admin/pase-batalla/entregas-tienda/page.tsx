import { Suspense } from "react";
import { StoreBattlePassDeliveries } from "@/components/battle-pass/admin/StoreBattlePassDeliveries";

export default function StoreBattlePassDeliveriesPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-tournament-dark-accent bg-white p-6 text-sm text-slate-500 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-300">
          Cargando entregas en tienda...
        </div>
      }
    >
      <StoreBattlePassDeliveries />
    </Suspense>
  );
}
