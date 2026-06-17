"use client";

import { IoClose } from "react-icons/io5";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { TOP_CUT_PV_BY_POSITION } from "@/logic";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export const TopCutGenerateModal = ({ open, onClose, onConfirm }: Props) => {
  useBodyScrollLock(open);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-2xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-300">
              Top 8
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Generar bracket
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Se congelara el ranking actual. Los PV extra se asignaran segun
              la posicion final de cada jugador en el bracket.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-tournament-dark-accent p-2 text-slate-500 transition hover:text-slate-900 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-white"
            aria-label="Cerrar modal"
          >
            <IoClose size={20} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TOP_CUT_PV_BY_POSITION.map((pv, index) => (
            <div
              key={index}
              className="rounded-lg border border-tournament-dark-accent bg-slate-50 px-3 py-3 text-center dark:border-tournament-dark-border dark:bg-tournament-dark-muted"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Puesto {index + 1}
              </p>
              <p className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-200">
                +{pv} PV
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-tournament-dark-accent px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Generar Top 8
          </button>
        </div>
      </form>
    </div>
  );
};
