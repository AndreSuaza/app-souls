"use client";

import { IoTrashOutline } from "react-icons/io5";
import { DateTimeFields } from "../../crear-torneo/DateTimeFields";
import { MarkdownEditor } from "@/components/ui/markdown/MarkdownEditor";
import { FormField, FormInput } from "@/components/ui/form";

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
        <FormField label="Título" labelFor="tournament-info-title">
          <FormInput
            id="tournament-info-title"
            value={form.title}
            disabled={isFinished}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
          />
        </FormField>

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
          <FormField label="Tipo de torneo" labelFor="tournament-info-type">
            <FormInput
              id="tournament-info-type"
              value={typeTournamentName ?? "-"}
              disabled
              className="bg-slate-50 text-slate-600 dark:bg-tournament-dark-muted dark:text-slate-300"
            />
          </FormField>

          <FormField label="Formato" labelFor="tournament-info-format">
            <FormInput
              id="tournament-info-format"
              value={format ?? "-"}
              disabled
              className="bg-slate-50 text-slate-600 dark:bg-tournament-dark-muted dark:text-slate-300"
            />
          </FormField>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Descripción
          </label>
          <MarkdownEditor
            label={undefined}
            value={form.description}
            onChange={(value) => onChange({ ...form, description: value })}
            placeholder="Describe el torneo usando markdown"
            maxLength={descriptionMaxLength}
            initialPreview
            enablePreviewToggle={!isFinished}
            readOnly={isFinished}
            enableCardInsert={false}
            enableDeckInsert={false}
            enableProductInsert={false}
          />
        </div>
      </div>
    </div>
  );
};
