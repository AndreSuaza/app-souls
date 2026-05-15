"use client";

import { useMemo, useState, useTransition } from "react";
import {
  importCardsFromExcelAction,
  type ImportCardsFromExcelResult,
} from "@/actions/cards/import-cards-from-excel.action";
import { useAlertConfirmationStore, useToastStore, useUIStore } from "@/store";

const REQUIRED_COLUMNS = [
  "Producto",
  "Numeracion",
  "Codigo",
  "Coste",
  "Rareza",
  "Name",
  "Tipo",
  "Rotation",
];

const OPTIONAL_COLUMNS = [
  "Fuerza",
  "Defensa",
  "Arquetipo",
  "Precios",
  "Efecto",
  "Keyword",
];

export const AdminCardsExcelImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportCardsFromExcelResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const showToast = useToastStore((state) => state.showToast);
  const showLoading = useUIStore((state) => state.showLoading);
  const hideLoading = useUIStore((state) => state.hideLoading);
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );

  const canSubmit = useMemo(() => !!file && !isPending, [file, isPending]);

  const handleImport = () => {
    if (!file) {
      showToast("Selecciona un archivo .xlsx para continuar.", "error");
      return;
    }

    openConfirmation({
      text: "Confirmar importación de cartas",
      description:
        "Se procesara la primera hoja del archivo y se insertaran solo filas validas sin conflictos de code.",
      action: async () => {
        startTransition(async () => {
          try {
            showLoading("Importando cartas desde Excel...");

            const formData = new FormData();
            formData.append("file", file);

            const response = await importCardsFromExcelAction(formData);
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
                : "No se pudo procesar el archivo Excel.",
              "error",
            );
          } finally {
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
          Importar cartas desde Excel
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Carga un archivo .xlsx para registrar cartas usando la estructura
          oficial de importación.
        </p>
      </header>

      <article className="space-y-4 rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Estructura esperada
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Se usara solamente la primera hoja del archivo. Las columnas deben
            mantener el nombre esperado.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-tournament-dark-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Obligatorias
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
              {REQUIRED_COLUMNS.map((column) => (
                <li key={column}>- {column}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-tournament-dark-border">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Opcionales
            </p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
              {OPTIONAL_COLUMNS.map((column) => (
                <li key={column}>- {column}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-dashed border-slate-300 p-4 dark:border-tournament-dark-border">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Archivo Excel (.xlsx)
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setFile(selected);
              setResult(null);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-100"
          />
          {file && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Archivo seleccionado:{" "}
              <span className="font-medium">{file.name}</span>
            </p>
          )}
          <button
            type="button"
            onClick={handleImport}
            disabled={!canSubmit}
            className="inline-flex items-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Importando..." : "Importar cartas"}
          </button>
        </div>
      </article>

      {result && (
        <article className="space-y-4 rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Resultado de importación
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
                Filas leidas
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {result.summary.rowsRead}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-tournament-dark-border">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Filas validas
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {result.summary.validRows}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-tournament-dark-border">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Insertadas
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {result.summary.insertedRows}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 dark:border-tournament-dark-border">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Invalidas
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {result.summary.invalidRows}
              </p>
            </div>
          </div>

          {result.conflictCodes.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
              <p className="font-semibold">Codes en conflicto</p>
              <ul className="mt-2 space-y-1">
                {result.conflictCodes.map((code) => (
                  <li key={code}>- {code}</li>
                ))}
              </ul>
            </div>
          )}

          {result.invalidRows.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Filas invalidas
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-tournament-dark-border">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-tournament-dark-border">
                  <thead className="bg-slate-50 dark:bg-tournament-dark-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-200">
                        Fila
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-200">
                        Code generado
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-200">
                        Carta
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-200">
                        Motivos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-tournament-dark-border">
                    {result.invalidRows.map((invalidRow) => (
                      <tr
                        key={`${invalidRow.rowNumber}-${invalidRow.name ?? "row"}`}
                      >
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {invalidRow.rowNumber}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {invalidRow.generatedCode ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {invalidRow.name ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                          {invalidRow.reasons.join(" | ")}
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
