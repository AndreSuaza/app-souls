"use client";

import { FormEvent, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (topCutPvBonus: number) => Promise<void>;
};

export const TopCutGenerateModal = ({ open, onClose, onConfirm }: Props) => {
  const [topCutPvBonus, setTopCutPvBonus] = useState("0");
  useBodyScrollLock(open);

  useEffect(() => {
    if (open) setTopCutPvBonus("0");
  }, [open]);

  if (!open) return null;

  const parsedBonus = Number(topCutPvBonus);
  const isValidBonus =
    Number.isInteger(parsedBonus) && Number.isFinite(parsedBonus) && parsedBonus >= 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidBonus) return;
    await onConfirm(parsedBonus);
  };

  const handleBonusChange = (value: string) => {
    if (value === "") {
      setTopCutPvBonus("");
      return;
    }

    const onlyDigits = value.replace(/\D/g, "");
    if (!onlyDigits) {
      setTopCutPvBonus("");
      return;
    }

    setTopCutPvBonus(String(Number(onlyDigits)));
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
              Se congelara el ranking actual y se asignara el bonus de PV a los
              jugadores clasificados cuando el torneo finalice.
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

        <label className="mt-6 flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          PV extra por clasificar al Top 8
          <input
            type="number"
            min={0}
            step={1}
            value={topCutPvBonus}
            onChange={(event) => handleBonusChange(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            className="rounded-lg border border-tournament-dark-accent bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-white"
            placeholder="Ej: 10"
          />
        </label>

        {!isValidBonus && (
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">
            Ingresa un numero entero mayor o igual a 0.
          </p>
        )}

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
            disabled={!isValidBonus}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
          >
            Generar Top 8
          </button>
        </div>
      </form>
    </div>
  );
};
