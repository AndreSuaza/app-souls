"use client";

interface Props {
  date: string;
  time: string;
  minDate: string;
  minTime: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}

export const DateTimeFields = ({
  date,
  time,
  minDate,
  minTime,
  onDateChange,
  onTimeChange,
}: Props) => {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium">Fecha</label>
        <input
          type="date"
          min={minDate}
          max={maxDate.toISOString().split("T")[0]}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Hora</label>
        <input
          type="time"
          min={minTime}
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>
    </div>
  );
};
