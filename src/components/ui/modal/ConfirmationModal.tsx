"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { useAlertConfirmationStore } from "@/store";

interface Props {
  className?: string;
}

export const ConfirmationModal = ({ className = "" }: Props) => {
  const { text, description, closeAlertConfirmation, runAction } =
    useAlertConfirmationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          "relative w-[92%] max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl",
          "text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white space-y-4",
          className,
        )}
      >
        <p className="text-center text-lg font-semibold leading-snug text-slate-900 dark:text-white">
          {text}
        </p>

        {description && (
          <p className="mb-6 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {description}
          </p>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={closeAlertConfirmation}
            className="rounded-lg border border-slate-400 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-purple-400 hover:text-purple-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:text-purple-300"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={clsx(
              "rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500",
              isSubmitting && "cursor-not-allowed opacity-70",
            )}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
