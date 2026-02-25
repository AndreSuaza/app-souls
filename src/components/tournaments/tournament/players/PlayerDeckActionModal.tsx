"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/modal/modal";

type Props = {
  deckId: string;
  canRemove: boolean;
  onRemove: () => void;
  onClose: () => void;
};

export const PlayerDeckActionModal = ({
  deckId,
  canRemove,
  onRemove,
  onClose,
}: Props) => {
  const primaryButtonClass =
    "inline-flex h-10 items-center justify-center rounded-lg bg-yellow-400 px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-yellow-300";
  const dangerButtonClass =
    "inline-flex h-10 items-center justify-center rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <Modal
      className="left-1/2 top-1/2 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white shadow-2xl transition-all dark:border-tournament-dark-border dark:bg-tournament-dark-surface overflow-hidden"
      close={onClose}
    >
      <div className="flex w-full flex-col overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Gestionar mazo asociado
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
            Puedes revisar o remover el mazo mientras el torneo está en progreso.
          </p>
        </div>

        <div className="flex flex-col gap-3 px-5 py-5">
          <Link
            href={`/mazos/${deckId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className={primaryButtonClass}
          >
            Ver mazo
          </Link>

          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            className={dangerButtonClass}
            title={
              canRemove
                ? "Eliminar mazo asociado"
                : "Solo disponible mientras el torneo está en progreso"
            }
          >
            Eliminar mazo
          </button>
        </div>
      </div>
    </Modal>
  );
};

