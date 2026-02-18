"use client";

import { FormField, FormSelect } from "@/components/ui/form";

type TournamentFormat = "Masters";

type Props = {
  value: TournamentFormat;
  onChange: (value: TournamentFormat) => void;
};

const TOURNAMENT_FORMATS: { value: TournamentFormat; label: string }[] = [
  { value: "Masters", label: "Masters" },
];

export const TournamentFormatSelect = ({ value, onChange }: Props) => {
  return (
    <FormField label="Formato" labelFor="tournament-format">
      <FormSelect
        id="tournament-format"
        value={value}
        onChange={(e) => onChange(e.target.value as TournamentFormat)}
      >
        {TOURNAMENT_FORMATS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </FormSelect>
    </FormField>
  );
};
