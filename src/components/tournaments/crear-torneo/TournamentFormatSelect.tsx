"use client";

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
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Formato
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TournamentFormat)}
        className="w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white"
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
