"use client";

import { useState } from "react";
import clsx from "clsx";
import { IoCloseOutline, IoDownloadOutline } from "react-icons/io5";
import { utils, writeFile } from "xlsx";
import { exportBattlePassPhysicalRewardsAction } from "@/actions/battle-pass/admin-battle-pass.action";
import { Modal } from "@/components/ui/modal/modal";
import { useToastStore } from "@/store";

type Props = {
  battlePassId: string | null;
  passLabel?: string;
  compact?: boolean;
  className?: string;
};

const statusLabels = {
  PENDING: "Pendiente",
  FULFILLED: "Entregada",
  MIXED: "Mixta",
} as const;

const buildFileName = (title: string, seasonNumber: number) => {
  const safeTitle = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `soporte-recompensas-t${seasonNumber}-${safeTitle || "pase"}.xlsx`;
};

export const BattlePassPhysicalRewardsExport = ({
  battlePassId,
  passLabel = "el pase seleccionado",
  compact = false,
  className,
}: Props) => {
  const showToast = useToastStore((state) => state.showToast);
  const [isOpen, setIsOpen] = useState(false);
  const [includeFulfilled, setIncludeFulfilled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (isDownloading) return;
    setIsOpen(false);
    setError(null);
  };

  const download = async () => {
    if (!battlePassId || isDownloading) return;

    setIsDownloading(true);
    setError(null);

    try {
      const result = await exportBattlePassPhysicalRewardsAction({
        battlePassId,
        includeFulfilled,
      });

      if (result.rows.length === 0) {
        setError(
          includeFulfilled
            ? "No hay recompensas físicas registradas para este pase."
            : "No hay recompensas físicas pendientes para este pase.",
        );
        return;
      }

      const rows = result.rows.map((row) => ({
        Nickname: row.nickname,
        Nombre: row.name,
        Pase: row.pass,
        Temporada: row.season,
        Nivel: row.level,
        Cantidad: row.quantity,
        Recompensa: row.reward,
        Estado: statusLabels[row.status],
        Tienda: row.store,
        Ciudad: row.city,
        Dirección: row.address,
      }));
      const worksheet = utils.json_to_sheet(rows);
      worksheet["!cols"] = [
        { wch: 20 },
        { wch: 28 },
        { wch: 28 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 32 },
        { wch: 14 },
        { wch: 24 },
        { wch: 18 },
        { wch: 36 },
      ];
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Recompensas");
      writeFile(workbook, buildFileName(result.pass.title, result.pass.seasonNumber));
      showToast("Soporte Excel descargado.", "success");
      setIsOpen(false);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "No se pudo generar el soporte Excel.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        disabled={!battlePassId}
        title={battlePassId ? "Descargar soporte Excel" : "Selecciona un pase primero"}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-200 dark:hover:bg-purple-500/20",
          compact && "px-2.5",
          className,
        )}
      >
        <IoDownloadOutline className="h-4 w-4" aria-hidden="true" />
        {!compact && "Exportar Excel"}
      </button>

      {isOpen && (
        <Modal
          close={close}
          hideCloseButton
          className="left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#4d4354] dark:bg-[#180f21]"
        >
          <div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-[#4d4354]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-600 dark:text-[#ddb7ff]">
                  Soporte de entregas
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-[#edddf7]">
                  Descargar Excel
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-[#cfc2d6]">
                  {passLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={isDownloading}
                aria-label="Cerrar modal"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#cfc2d6] dark:hover:bg-[#302639] dark:hover:text-white"
              >
                <IoCloseOutline className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <fieldset className="space-y-2">
                <legend className="text-sm font-bold text-slate-900 dark:text-[#edddf7]">
                  ¿Qué recompensas incluir?
                </legend>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-purple-300 bg-purple-50 p-3 dark:border-purple-400/40 dark:bg-purple-500/10">
                  <input
                    type="radio"
                    name="battle-pass-export-scope"
                    checked={!includeFulfilled}
                    onChange={() => setIncludeFulfilled(false)}
                    className="mt-0.5 accent-purple-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-[#edddf7]">
                      Solo pendientes
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-[#cfc2d6]">
                      Recompensas listas para enviar.
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-[#4d4354]">
                  <input
                    type="radio"
                    name="battle-pass-export-scope"
                    checked={includeFulfilled}
                    onChange={() => setIncludeFulfilled(true)}
                    className="mt-0.5 accent-purple-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900 dark:text-[#edddf7]">
                      Pendientes y entregadas
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-[#cfc2d6]">
                      Incluye el estado de cada recompensa.
                    </span>
                  </span>
                </label>
              </fieldset>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  disabled={isDownloading}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-purple-400 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#4d4354] dark:text-[#cfc2d6] dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void download()}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#7c03d3] dark:hover:bg-[#9d35ed]"
                >
                  <IoDownloadOutline className="h-4 w-4" aria-hidden="true" />
                  {isDownloading ? "Generando..." : "Descargar"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
