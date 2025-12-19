"use client";

import { IoSaveOutline } from "react-icons/io5";

interface TournamentInfoActionsProps {
  hasChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export const TournamentInfoActions = ({
  hasChanges,
  onSave,
  onDiscard,
}: TournamentInfoActionsProps) => {
  return (
    <div className="flex justify-between items-center">
      {hasChanges && (
        <div className="flex gap-3 ml-auto">
          <button
            onClick={onDiscard}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-200"
          >
            Descartar cambios
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <IoSaveOutline />
            Guardar cambios
          </button>
        </div>
      )}
    </div>
  );
};
