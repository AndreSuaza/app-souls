"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

type InitialPointsModalProps = {
  user: { id: string; nickname: string };
  onConfirm: (points: number) => void;
  onCancel: () => void;
};

export const InitialPointsModal = ({
  user,
  onConfirm,
  onCancel,
}: InitialPointsModalProps) => {
  const [points, setPoints] = useState("0");

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded shadow-xl w-80">
        <h2 className="font-bold text-lg mb-3">Jugador tardío</h2>
        <p className="text-sm mb-3">
          Ingrese los puntos iniciales para <strong>{user.nickname}</strong>
        </p>

        <input
          type="number"
          className="w-full border rounded px-2 py-1 mb-4"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
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
            onClick={() => onConfirm(parseInt(points, 10) || 0)}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
