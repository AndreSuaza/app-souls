"use client";

import { useMemo, useState, useTransition } from "react";
import {
  updateCardImagesFromZipAction,
  type UpdateCardImagesFromZipResult,
} from "@/actions";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";
import { AdminCardsOperationProgress } from "./AdminCardsOperationProgress";

const UPDATE_PROGRESS_STEPS = [
  { threshold: 20, message: "Preparando ZIP para enviar al servidor..." },
  { threshold: 42, message: "Validando nombres y archivos del ZIP..." },
  {
    threshold: 62,
    message: "Buscando cartas asociadas en la base de datos...",
  },
  { threshold: 78, message: "Creando backups temporales en R2..." },
  { threshold: 92, message: "Convirtiendo y reemplazando imagenes..." },
  {
    threshold: 100,
    message: "Actualizando versión de imagenes y limpiando backups...",
  },
];

export const AdminCardImagesBulkUpdate = () => {
  const [imagesZip, setImagesZip] = useState<File | null>(null);
  const [result, setResult] = useState<UpdateCardImagesFromZipResult | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );

  const canSubmit = useMemo(
    () => !!imagesZip && !isPending && !isProcessing,
    [imagesZip, isPending, isProcessing],
  );

  const handleUpdate = () => {
    if (!imagesZip) {
      showToast("Selecciona un archivo .zip con las imagenes.", "error");
      return;
    }

    openConfirmation({
      text: "Confirmar actualizacion masiva",
      description:
        "Se validara el ZIP completo. Si algo falla, no se reemplazara ninguna imagen. Durante el proceso se crea un backup temporal en R2.",
      action: async () => {
        startTransition(async () => {
          try {
            setIsProcessing(true);
            setResult(null);
            showLoading("Validando y actualizando imagenes...");

            const formData = new FormData();
            formData.append("imagesZip", imagesZip);

            const response = await updateCardImagesFromZipAction(formData);
            setResult(response);

            if (response.status === "conflict") {
              showToast(response.message, "error");
              return;
            }

            showToast(response.message, "success");
          } catch (error) {
            showToast(
              error instanceof Error
                ? error.message
                : "No se pudieron actualizar las imagenes.",
              "error",
            );
          } finally {
            setIsProcessing(false);
            hideLoading();
          }
        });

        return true;
      },
    });
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Actualizar imagenes de cartas
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Reemplaza masivamente imagenes existentes en R2 usando un ZIP. La
          operacion valida todo antes de reemplazar y restaura desde backup si
          ocurre un error.
        </p>
      </header>

      <article className="space-y-4 rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-tournament-dark-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              ZIP esperado
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
              <li>- Formato: .zip</li>
              <li>- Imagenes: .webp, .png, .jpg, .jpeg o .avif</li>
              <li>- Nombre: {"{code}-{idd}"}</li>
              <li>- Ejemplo: CAT-001-1234.webp</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-tournament-dark-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Reglas
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
              <li>- Cada imagen debe existir como carta en la DB.</li>
              <li>- La imagen actual debe existir en R2.</li>
              <li>- No se aceptan duplicados ni archivos extra.</li>
              <li>- Todas se normalizan a WebP en R2.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-dashed border-slate-300 p-4 dark:border-tournament-dark-border">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            ZIP de imagenes (.zip)
          </label>
          <input
            type="file"
            accept=".zip"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setImagesZip(selected);
              setResult(null);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-100"
          />
          {imagesZip && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ZIP seleccionado:{" "}
              <span className="font-medium">{imagesZip.name}</span>
            </p>
          )}
          <button
            type="button"
            onClick={handleUpdate}
            disabled={!canSubmit}
            className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing || isPending
              ? "Actualizando..."
              : "Actualizar imagenes"}
          </button>

          <AdminCardsOperationProgress
            isActive={isProcessing || isPending}
            title="Actualizacion en progreso"
            steps={UPDATE_PROGRESS_STEPS}
          />
        </div>
      </article>

      {result && (
        <article className="space-y-4 rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Resultado
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                result.status === "success"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-200"
                  : "bg-red-100 text-red-700 dark:bg-red-600/20 dark:text-red-200"
              }`}
            >
              {result.status === "success" ? "Completado" : "Conflicto"}
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            {result.message}
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 p-3 dark:border-tournament-dark-border">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Imagenes leidas
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {result.summary.imagesRead}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-tournament-dark-border">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Coincidencias
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {result.summary.matchedImages}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-tournament-dark-border">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Actualizadas
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {result.summary.updatedImages}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-tournament-dark-border">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Backups
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {result.summary.backupsCreated}
              </p>
            </div>
          </div>

          {result.imageErrors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
              <p className="font-semibold">Errores de imagenes</p>
              <ul className="mt-2 space-y-1">
                {result.imageErrors.map((error) => (
                  <li key={error}>- {error}</li>
                ))}
              </ul>
            </div>
          )}

          {result.updatedCards.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Cartas actualizadas
              </h3>

              <div className="max-h-96 overflow-auto rounded-xl border border-slate-200 dark:border-tournament-dark-border">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-tournament-dark-border">
                  <thead className="bg-slate-50 dark:bg-tournament-dark-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-200">
                        Code
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-200">
                        IDD
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-200">
                        Carta
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-200">
                        R2
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-tournament-dark-border">
                    {result.updatedCards.map((card) => (
                      <tr key={`${card.code}-${card.idd}`}>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {card.code}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {card.idd}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {card.name}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {card.imageKey}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </article>
      )}
    </section>
  );
};
