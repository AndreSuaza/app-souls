"use client";

type TournamentFormat = "default" | "Masters";

type Props = {
  value: TournamentFormat;
  onChange: (value: TournamentFormat) => void;
};

const TOURNAMENT_FORMATS: { value: TournamentFormat; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "Masters", label: "Masters" },
];

export const TournamentFormatSelect = ({ value, onChange }: Props) => {
  return (
    <div>
      <label className="block text-sm font-medium">Formato</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TournamentFormat)}
        className="w-full border rounded p-2"
      >
        {TOURNAMENT_FORMATS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
};
