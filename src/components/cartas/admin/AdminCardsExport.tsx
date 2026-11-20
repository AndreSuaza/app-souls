"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { FiCheck, FiDownload } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";
import { exportAdminCardsAction } from "@/actions/cards/admin-cards.action";
import {
  ADMIN_CARD_EXPORT_COLUMNS,
  type AdminCardExportColumnKey,
} from "@/schemas/cards/admin-card-export.schema";
import { Modal } from "@/components/ui/modal/modal";
import { useToastStore } from "@/store";

type Product = {
  id: string;
  name: string;
  code: string;
};

type Props = {
  products: Product[];
};

type ExportScope = "allActive" | "products";
type ExportFormat = "json" | "csv" | "txt" | "xlsx";

const ALL_COLUMN_KEYS = ADMIN_CARD_EXPORT_COLUMNS.map(
  ({ key }) => key,
) as AdminCardExportColumnKey[];

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: "xlsx", label: "Excel" },
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "txt", label: "TXT" },
];

const safeFilePart = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "cartas";

const getFileName = (scope: ExportScope, format: ExportFormat) => {
  const scopeLabel = scope === "products" ? "productos" : "activas";
  const date = new Date().toISOString().slice(0, 10);
  return `cartas-${safeFilePart(scopeLabel)}-${date}.${format}`;
};

const cellToText = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const escapeCsvCell = (value: unknown) =>
  `"${cellToText(value).replace(/"/g, '""')}"`;

const escapeTabCell = (value: unknown) =>
  cellToText(value).replace(/\t/g, " ").replace(/\r?\n/g, " ");

const downloadBlob = (content: BlobPart, fileName: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const AdminCardsExport = ({ products }: Props) => {
  const showToast = useToastStore((state) => state.showToast);
  const [isOpen, setIsOpen] = useState(false);
  const [scope, setScope] = useState<ExportScope>("allActive");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] =
    useState<AdminCardExportColumnKey[]>(ALL_COLUMN_KEYS);
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allColumnsSelected = selectedColumns.length === ALL_COLUMN_KEYS.length;
  const canDownload =
    selectedColumns.length > 0 &&
    (scope === "allActive" || selectedProducts.length > 0) &&
    !isDownloading;

  const selectedProductLabel = useMemo(() => {
    if (selectedProducts.length === 0) return "Ningún producto seleccionado";
    return `${selectedProducts.length} producto${
      selectedProducts.length === 1 ? "" : "s"
    } seleccionado${selectedProducts.length === 1 ? "" : "s"}`;
  }, [selectedProducts.length]);

  const close = () => {
    if (isDownloading) return;
    setIsOpen(false);
    setError(null);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
    setError(null);
  };

  const toggleColumn = (column: AdminCardExportColumnKey) => {
    setSelectedColumns((current) =>
      current.includes(column)
        ? current.filter((key) => key !== column)
        : [...current, column],
    );
    setError(null);
  };

  const toggleAllColumns = () => {
    setSelectedColumns(allColumnsSelected ? [] : ALL_COLUMN_KEYS);
    setError(null);
  };

  const download = async () => {
    if (!canDownload) {
      setError(
        selectedColumns.length === 0
          ? "Selecciona al menos una columna."
          : "Selecciona al menos un producto.",
      );
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const result = await exportAdminCardsAction({
        scope,
        productIds: selectedProducts,
        columns: selectedColumns,
        format,
      });

      if (result.rows.length === 0) {
        setError("No hay cartas activas para los criterios seleccionados.");
        return;
      }

      const definitions = ADMIN_CARD_EXPORT_COLUMNS.filter(({ key }) =>
        selectedColumns.includes(key),
      );
      const rows = result.rows.map((row) =>
        Object.fromEntries(
          definitions.map(({ key, label }) => [label, row[key] ?? ""]),
        ),
      );
      const fileName = getFileName(scope, format);

      if (format === "json") {
        downloadBlob(
          JSON.stringify(rows, null, 2),
          fileName,
          "application/json;charset=utf-8",
        );
      } else if (format === "csv" || format === "txt") {
        const separator = format === "csv" ? "," : "\t";
        const escape = format === "csv" ? escapeCsvCell : escapeTabCell;
        const header = definitions.map(({ label }) => escape(label)).join(separator);
        const body = result.rows.map((row) =>
          definitions
            .map(({ key }) => escape(row[key]))
            .join(separator),
        );
        const text = [header, ...body].join("\r\n");
        const content = format === "csv" ? `\uFEFF${text}` : text;
        downloadBlob(
          content,
          fileName,
          format === "csv" ? "text/csv;charset=utf-8" : "text/plain;charset=utf-8",
        );
      } else {
        const { utils, writeFile } = await import("xlsx");
        const worksheet = utils.json_to_sheet(rows);
        worksheet["!cols"] = definitions.map(({ label }) => ({
          wch: Math.min(48, Math.max(12, label.length + 4)),
        }));
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Cartas");
        writeFile(workbook, fileName);
      }

      showToast(`${result.rows.length} cartas exportadas correctamente.`, "success");
      close();
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "No se pudo generar la exportación.",
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
        className="inline-flex items-center gap-2 rounded-lg border border-tournament-dark-accent bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
      >
        <FiDownload className="h-4 w-4" />
        Exportar cartas
      </button>

      {isOpen && (
        <Modal
          close={close}
          hideCloseButton
          className="left-1/2 top-1/2 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
        >
          <div>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-tournament-dark-border">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-600 dark:text-purple-300">
                  Administración de cartas
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  Exportar cartas
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Elige el alcance, las columnas y el formato del archivo.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={isDownloading}
                aria-label="Cerrar modal"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg p-0 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-white"
              >
                <IoCloseOutline className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <fieldset className="space-y-2">
                <legend className="text-sm font-bold text-slate-900 dark:text-white">
                  Cartas a exportar
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-purple-300 bg-purple-50 p-3 dark:border-purple-400/40 dark:bg-purple-500/10">
                    <input
                      type="radio"
                      name="admin-card-export-scope"
                      checked={scope === "allActive"}
                      onChange={() => {
                        setScope("allActive");
                        setError(null);
                      }}
                      className="shrink-0 accent-purple-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        Todas las activas
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        Ignora la paginación y los filtros de la tabla.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-tournament-dark-border">
                    <input
                      type="radio"
                      name="admin-card-export-scope"
                      checked={scope === "products"}
                      onChange={() => {
                        setScope("products");
                        setError(null);
                      }}
                      className="shrink-0 accent-purple-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        Por productos
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        Exporta las cartas activas de varios productos.
                      </span>
                    </span>
                  </label>
                </div>
              </fieldset>

              {scope === "products" && (
                <fieldset className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <legend className="text-sm font-bold text-slate-900 dark:text-white">
                      Productos
                    </legend>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedProductLabel}
                    </span>
                  </div>
                  <div className="grid max-h-44 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-3 sm:grid-cols-2 dark:border-tournament-dark-border">
                    {products.map((product) => {
                      const checked = selectedProducts.includes(product.id);
                      return (
                        <label
                          key={product.id}
                          className={clsx(
                            "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                            checked
                              ? "border-purple-400 bg-purple-50 text-purple-800 dark:border-purple-400/50 dark:bg-purple-500/10 dark:text-purple-100"
                              : "border-transparent text-slate-700 hover:border-purple-300 dark:text-slate-200 dark:hover:border-purple-400/40",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProduct(product.id)}
                            className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="truncate">
                            {product.code} - {product.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              <fieldset className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <legend className="text-sm font-bold text-slate-900 dark:text-white">
                    Columnas
                  </legend>
                  <button
                    type="button"
                    onClick={toggleAllColumns}
                    className="text-xs font-semibold text-purple-700 hover:underline dark:text-purple-300"
                  >
                    {allColumnsSelected ? "Limpiar" : "Seleccionar todas"}
                  </button>
                </div>
                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-3 dark:border-tournament-dark-border">
                  {ADMIN_CARD_EXPORT_COLUMNS.map(({ key, label }) => {
                    const checked = selectedColumns.includes(key);
                    return (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleColumn(key)}
                          className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-sm font-bold text-slate-900 dark:text-white">
                  Formato
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {FORMAT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={clsx(
                        "flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition",
                        format === option.value
                          ? "border-purple-500 bg-purple-50 text-purple-800 dark:bg-purple-500/10 dark:text-purple-100"
                          : "border-slate-200 text-slate-700 hover:border-purple-300 dark:border-tournament-dark-border dark:text-slate-200 dark:hover:border-purple-400/40",
                      )}
                    >
                      <input
                        type="radio"
                        name="admin-card-export-format"
                        value={option.value}
                        checked={format === option.value}
                        onChange={() => setFormat(option.value)}
                        className="sr-only"
                      />
                      {format === option.value && <FiCheck className="h-4 w-4" />}
                      {option.label}
                    </label>
                  ))}
                </div>
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
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-purple-400 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void download()}
                  disabled={!canDownload}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiDownload className="h-4 w-4" />
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
