"use client";

import { useEffect, useMemo, useState } from "react";
/* eslint-disable @next/next/no-img-element */
import { FiX } from "react-icons/fi";
import { Modal } from "../modal/modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
};

const isHttpsUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const MarkdownImageUrlModal = ({ isOpen, onClose, onInsert }: Props) => {
  const [url, setUrl] = useState("");
  const [hasPreviewError, setHasPreviewError] = useState(false);

  const trimmedUrl = url.trim();
  const isValid = useMemo(
    () => (trimmedUrl ? isHttpsUrl(trimmedUrl) : false),
    [trimmedUrl],
  );

  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setHasPreviewError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showError = Boolean(trimmedUrl) && !isValid;

  const handleInsert = () => {
    if (!isValid) return;
    onInsert(trimmedUrl);
    setUrl("");
    setHasPreviewError(false);
  };

  return (
    <Modal
      className="inset-0 flex items-center justify-center p-4"
      close={onClose}
      hideCloseButton
    >
      <div className="w-full max-w-2xl rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Insertar imagen por URL
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Agrega una URL pública (https) para mostrar la imagen en el
              contenido.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-tournament-dark-accent text-slate-500 transition hover:bg-slate-100 hover:text-purple-600 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted dark:hover:text-purple-300"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setHasPreviewError(false);
            }}
            placeholder="https://"
            className="w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500"
          />
          {showError && (
            <p className="text-xs text-red-500 dark:text-red-400">
              La URL debe comenzar con https.
            </p>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-dashed border-tournament-dark-accent bg-slate-50 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted-strong">
          <div className="flex h-[220px] items-center justify-center">
            {isValid && !hasPreviewError ? (
              <img
                src={trimmedUrl}
                alt="Vista previa"
                className="h-full w-full rounded-md object-contain"
                onError={() => setHasPreviewError(true)}
              />
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Ingresa una URL para previsualizar la imagen
              </span>
            )}
          </div>
          {hasPreviewError && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">
              No se pudo cargar la imagen. Verifica la URL.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-tournament-dark-accent bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!isValid}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-400"
          >
            Insertar imagen
          </button>
        </div>
      </div>
    </Modal>
  );
};
