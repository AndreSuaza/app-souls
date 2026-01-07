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
            className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-muted-hover"
          >
            Descartar cambios
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white shadow-lg shadow-purple-600/20 transition-colors hover:bg-purple-600/90"
          >
            <IoSaveOutline />
            Guardar cambios
          </button>
        </div>
      )}
    </div>
  );
};
