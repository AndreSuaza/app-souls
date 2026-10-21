"use client";

import { FormField, FormSelect } from "@/components/ui/form";

type TournamentFormat = "Masters" | "Elimination";

type Props = {
  value: TournamentFormat;
  onChange: (value: TournamentFormat) => void;
  canCreateElimination?: boolean;
};

const TOURNAMENT_FORMATS: { value: TournamentFormat; label: string }[] = [
  { value: "Masters", label: "Masters" },
  { value: "Elimination", label: "Eliminación directa" },
];

export const TournamentFormatSelect = ({
  value,
  onChange,
  canCreateElimination = false,
}: Props) => {
  return (
    <FormField label="Formato" labelFor="tournament-format">
      <FormSelect
        id="tournament-format"
        value={value}
        onChange={(e) => onChange(e.target.value as TournamentFormat)}
      >
        {TOURNAMENT_FORMATS.filter(
          (format) => format.value !== "Elimination" || canCreateElimination,
        ).map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </FormSelect>
    </FormField>
  );
};
