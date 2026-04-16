"use client";

import { IoWarningOutline } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { resetEloSeasonAction } from "@/actions";

export const AdminResetEloCard = () => {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const openAlertConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);

  if (role !== "admin") return null;

  const handleResetElo = () => {
    openAlertConfirmation({
      text: "Reiniciar Elo de jugadores?",
      description:
        "Se guardara el Elo actual en el historico y todos los jugadores quedaran en 0.",
      confirmText: "REINICIAR ELO",
      confirmPlaceholder: "Escribe REINICIAR ELO",
      action: async () => {
        try {
          showLoading("Reiniciando Elo...");
          const result = await resetEloSeasonAction({});
          hideLoading();
          if (!result.ok) return false;
          showToast(
            `Elo reiniciado. Temporada ${result.seasonNumber}.`,
            "success",
          );
          return true;
        } catch {
          hideLoading();
          return false;
        }
      },
      onError: () => {
        hideLoading();
        showToast("No se pudo reiniciar el Elo.", "error");
      },
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300">
          <IoWarningOutline size={18} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Acciones criticas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Requiere confirmacion manual.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Reinicia el Elo de todos los jugadores y guarda el historico de la
          temporada actual.
        </p>
        <button
          type="button"
          onClick={handleResetElo}
          className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
        >
          Reiniciar Elo global
        </button>
      </div>
    </div>
  );
};
