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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded shadow-xl w-80">
        <h2 className="font-bold text-lg mb-3">Jugador tardío</h2>

        <p className="text-sm mb-3">
          Ingrese la cantidad de <strong>rondas ganadas</strong> para{" "}
          <strong>{user.nickname}</strong>
        </p>

        <p className="text-xs text-gray-500 mb-2">
          Máximo permitido: {maxRounds}
        </p>

        <input
          type="number"
          min={0}
          max={maxRounds}
          className="w-full border rounded px-2 py-1 mb-4"
          value={roundsWon}
          onChange={(e) => setRoundsWon(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
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
