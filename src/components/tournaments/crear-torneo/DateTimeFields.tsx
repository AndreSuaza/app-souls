"use client";

interface DateTimeFieldsProps {
  date: string;
  time: string;
  minDate: string;
  minTime: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  disabled?: boolean;
}

const MINUTES = ["00", "15", "30", "45"];

export const DateTimeFields = ({
  date,
  time,
  minDate,
  onDateChange,
  onTimeChange,
  disabled = false,
}: DateTimeFieldsProps) => {
  const maxDate = new Date();

  // Fecha máxima permitida (1 año en el futuro)
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Minutos mínimos permitidos para la hora actual
  const roundedMinute = Math.ceil(currentMinute / 15) * 15;
  // Si el redondeo da 60, los minutos arrancan en 00 de la siguiente hora
  const minAllowedMinute = roundedMinute === 60 ? 0 : roundedMinute;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Fecha
        </label>
        <input
          type="date"
          disabled={disabled}
          min={minDate}
          max={maxDate.toISOString().split("T")[0]}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Hora
        </label>

        <div className="flex gap-2">
          {/* Horas */}
          <select
            value={time.split(":")[0]}
            disabled={disabled}
            onChange={(e) =>
              onTimeChange(`${e.target.value}:${time.split(":")[1]}`)
            }
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white"
          >
            {Array.from({ length: 24 }).map((_, h) => {
              const hour = String(h).padStart(2, "0");

              // Bloquear horas pasadas si es hoy
              // Si la hora actual ya no tiene minutos válidos, se bloquea completamente
              if (
                date === today &&
                (h < currentHour || (h === currentHour && roundedMinute === 60))
              ) {
                return null;
              }

              return (
                <option key={hour} value={hour}>
                  {hour}
                </option>
              );
            })}
          </select>

          {/* Minutos (15 en 15) */}
          <select
            value={time.split(":")[1]}
            disabled={disabled}
            onChange={(e) =>
              onTimeChange(`${time.split(":")[0]}:${e.target.value}`)
            }
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white"
          >
            {MINUTES.map((m) => {
              const selectedHour = Number(time.split(":")[0]);

              // Si es hoy y es la hora actual, bloquear minutos pasados
              if (
                date === today &&
                selectedHour === currentHour &&
                Number(m) < minAllowedMinute
              ) {
                return null;
              }

              return (
                <option key={m} value={m}>
                  {m}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
};
