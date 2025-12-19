"use client";

import { IoTrashOutline } from "react-icons/io5";
import { useAlertConfirmationStore } from "@/store";
import { DateTimeFields } from "../../crear-torneo/DateTimeFields";

interface TournamentForm {
  title: string;
  description: string;
  date: Date;
}

interface TournamentInfoCardProps {
  form: TournamentForm;
  onChange: (form: TournamentForm) => void;
  onDelete: () => void;
  isFinished: boolean;
}

export const TournamentInfoCard = ({
  form,
  onChange,
  onDelete,
  isFinished,
}: TournamentInfoCardProps) => {
  const confirm = useAlertConfirmationStore((s) => s.openAlertConfirmation);

  const date = form.date.toISOString().split("T")[0];
  const time = form.date.toTimeString().slice(0, 5);

  const handleDelete = () => {
    confirm({
      text: "¿Cancelar torneo?",
      description:
        "Esta acción eliminará el torneo de forma permanente y no se puede deshacer.",
      action: async () => {
        onDelete();
        return true;
      },
    });
  };

  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Información del torneo
        </h2>

        <button
          onClick={handleDelete}
          disabled={isFinished}
          className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          <IoTrashOutline className="hidden sm:block" />
          Cancelar torneo
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Título</label>
          <input
            className="w-full border rounded p-2"
            value={form.title}
            disabled={isFinished}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Descripción</label>
          <textarea
            className="w-full border rounded p-2"
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
      </div>
    </div>
  );
};
