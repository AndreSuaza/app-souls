"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

type InitialPointsModalProps = {
  user: { id: string; nickname: string };
  maxRounds: number;
  onConfirm: (roundsWon: number) => void;
  onCancel: () => void;
};

export const InitialPointsModal = ({
  user,
  maxRounds,
  onConfirm,
  onCancel,
}: InitialPointsModalProps) => {
  const [roundsWon, setRoundsWon] = useState("0");

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
          Jugador tardío
        </h2>

        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          Ingrese la cantidad de <strong>rondas ganadas</strong> para{" "}
          <strong>{user.nickname}</strong>
        </p>

        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
          Máximo permitido: {maxRounds}
        </p>

        <input
          type="number"
          min={0}
          max={maxRounds}
          className="mb-4 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white"
          value={roundsWon}
          onChange={(e) => setRoundsWon(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="rounded-lg bg-purple-600 px-3 py-1 text-white shadow-lg shadow-purple-600/20 hover:bg-purple-600/90"
            onClick={() =>
              onConfirm(Math.min(parseInt(roundsWon, 10) || 0, maxRounds))
            }
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
