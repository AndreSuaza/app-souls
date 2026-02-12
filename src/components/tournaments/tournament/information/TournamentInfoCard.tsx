"use client";

import { useState } from "react";
import { IoTrashOutline } from "react-icons/io5";
import { DateTimeFields } from "../../crear-torneo/DateTimeFields";
import { MarkdownContent } from "@/components/ui/markdown/MarkdownContent";
import { MarkdownEditor } from "@/components/ui/markdown/MarkdownEditor";

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
  // Alterna entre la vista previa y el editor del markdown.
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  // Ajusta el limite segun el tier del torneo.
  const descriptionMaxLength =
    typeTournamentName?.toLowerCase().includes("tier 1") ||
    typeTournamentName?.toLowerCase().includes("tier 2")
      ? 500
      : 300;

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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Descripción
            </label>
            {!isFinished && (
              <button
                type="button"
                onClick={() => setIsEditingDescription((prev) => !prev)}
                className="rounded-md px-3 py-1 text-xs font-semibold text-purple-600 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10"
              >
                {isEditingDescription ? "Cerrar edici\u00f3n" : "Editar"}
              </button>
            )}
          </div>

          {isEditingDescription && !isFinished ? (
            <MarkdownEditor
              label={undefined}
              value={form.description}
              onChange={(value) => onChange({ ...form, description: value })}
              placeholder="Describe el torneo usando markdown"
              maxLength={descriptionMaxLength}
            />
          ) : (
            <div className="rounded-lg border border-tournament-dark-accent bg-slate-50 p-3 dark:border-tournament-dark-border dark:bg-tournament-dark-muted">
              <MarkdownContent
                content={form.description}
                className="text-sm text-slate-700 dark:text-slate-200"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
