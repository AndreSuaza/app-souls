"use client";

import { IoTrashOutline } from "react-icons/io5";
import { DateTimeFields } from "../../crear-torneo/DateTimeFields";

interface TournamentForm {
  title: string;
  description: string;
  date: Date;
}

interface TournamentInfoCardProps {
  form: TournamentForm;
  typeTournamentName?: string;
  format?: string;
  onChange: (form: TournamentForm) => void;
  onDelete: () => void;
  isFinished: boolean;
}

export const TournamentInfoCard = ({
  form,
  typeTournamentName,
  format,
  onChange,
  onDelete,
  isFinished,
}: TournamentInfoCardProps) => {
  const date = form.date.toISOString().split("T")[0];
  const time = form.date.toTimeString().slice(0, 5);

  return (
    <div className="rounded-2xl border border-tournament-dark-accent bg-white p-6 shadow-sm space-y-6 dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Información del torneo
        </h2>

        {!isFinished && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700"
          >
            <IoTrashOutline className="hidden sm:block" />
            Cancelar torneo
          </button>
        )}
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Título
          </label>
          <input
            className="w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white"
            value={form.title}
            disabled={isFinished}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Descripción
          </label>
          <textarea
            className="w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white"
            rows={3}
            value={form.description}
            disabled={isFinished}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
          />
        </div>

        <DateTimeFields
          date={date}
          time={time}
          minDate={new Date().toISOString().split("T")[0]}
          minTime={time}
          onDateChange={(d) =>
            onChange({ ...form, date: new Date(`${d}T${time}:00`) })
          }
          onTimeChange={(t) =>
            onChange({ ...form, date: new Date(`${date}T${t}:00`) })
          }
          disabled={isFinished}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Tipo de torneo
            </label>
            <input
              className="w-full rounded-lg border border-tournament-dark-accent bg-slate-50 p-2 text-slate-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300"
              value={typeTournamentName ?? "-"}
              disabled
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Formato
            </label>
            <input
              className="w-full rounded-lg border border-tournament-dark-accent bg-slate-50 p-2 text-slate-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300"
              value={format ?? "-"}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
};
