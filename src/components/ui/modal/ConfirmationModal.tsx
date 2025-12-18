"use client";

import { useAlertConfirmationStore } from "@/store";

interface Props {
  className?: string;
}

export const ConfirmationModal = ({ className = "" }: Props) => {
  const { text, description, closeAlertConfirmation, runAction } =
    useAlertConfirmationStore();

  const handleConfirm = async () => {
    await runAction();
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      {/* Overlay */}
      <div
        onClick={closeAlertConfirmation}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div
        className={`
          relative bg-white shadow-2xl rounded-xl border border-gray-200 
          p-6 w-[380px] animate-fadeIn 
          ${className}
        `}
      >
        <p className="text-center text-gray-800 font-semibold text-lg mb-4 leading-snug">
          {text}
        </p>

        {description && (
          <p className="text-center text-sm text-gray-600 mb-6 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={closeAlertConfirmation}
            className="px-5 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition"
          >
            Confirmar
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
