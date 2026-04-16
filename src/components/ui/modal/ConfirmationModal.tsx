"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { useAlertConfirmationStore } from "@/store";

interface Props {
  className?: string;
}

export const ConfirmationModal = ({ className = "" }: Props) => {
  const {
    text,
    description,
    confirmText,
    confirmPlaceholder,
    closeAlertConfirmation,
    runAction,
  } = useAlertConfirmationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const hasTextConfirmation = !!confirmText;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    // Evita el scroll de fondo mientras el modal este abierto.
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleConfirm = async () => {
    // Evita dobles confirmaciones antes de que el modal se cierre.
    if (isSubmitting) return;
    if (!!confirmText && confirmValue.trim() !== confirmText) return;
    setIsSubmitting(true);
    await runAction();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Overlay */}
      <div
        onClick={closeAlertConfirmation}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div
        className={clsx(
          "relative w-[92%] rounded-xl border border-slate-200 bg-white p-6 shadow-2xl",
          "text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white space-y-4",
          hasTextConfirmation ? "max-w-lg" : "max-w-sm",
          className,
        )}
      >
        {hasTextConfirmation ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300">
                <IoWarningOutline size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-left text-lg font-semibold text-slate-900 dark:text-white">
                  {text}
                </p>
                {description && (
                  <p className="text-left text-sm text-slate-600 dark:text-slate-300">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Escribe{" "}
                <span className="font-bold text-slate-800 dark:text-white">
                  &quot;{confirmText}&quot;
                </span>{" "}
                para confirmar
              </p>
              <input
                type="text"
                value={confirmValue}
                onChange={(event) => setConfirmValue(event.target.value)}
                placeholder={confirmPlaceholder ?? confirmText}
                className={clsx(
                  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900",
                  "focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200",
                  "dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white dark:focus:ring-purple-500/30",
                )}
              />
            </div>
          </div>
        ) : (
          <>
            <p className="text-center text-lg font-semibold leading-snug text-slate-900 dark:text-white">
              {text}
            </p>

            {description && (
              <p className="mb-6 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {description}
              </p>
            )}
          </>
        )}

        <div
          className={clsx(
            "flex gap-3",
            hasTextConfirmation
              ? "flex-col-reverse sm:flex-row sm:justify-end"
              : "flex-col justify-center sm:flex-row",
          )}
        >
          <button
            onClick={closeAlertConfirmation}
            className="rounded-lg border border-slate-400 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-purple-400 hover:text-purple-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:text-purple-300"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={
              isSubmitting ||
              (!!confirmText && confirmValue.trim() !== confirmText)
            }
            className={clsx(
              "rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500",
              isSubmitting && "cursor-not-allowed opacity-70",
              !!confirmText &&
                confirmValue.trim() !== confirmText &&
                "cursor-not-allowed opacity-70",
            )}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
