import clsx from "clsx";
import { useTournamentTimer } from "@/hooks";

type TournamentStatus = "pending" | "in_progress" | "finished" | "cancelled";
type TimerSize = "sm" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";

type TimerClassNames = {
  container?: string;
  box?: string;
  value?: string;
  label?: string;
  separator?: string;
};

type Props = {
  roundId: string | null;
  startedAt: string | null;
  status: TournamentStatus;
  size?: TimerSize;
  classNames?: TimerClassNames;
};

export function TournamentTimerDisplay({
  roundId,
  startedAt,
  status,
  size = "sm",
  classNames,
}: Props) {
  const { hours, minutes, seconds, elapsedMs } = useTournamentTimer(
    roundId,
    startedAt,
    status
  );

  const isOvertime = elapsedMs >= 40 * 60 * 1000;

  return (
    <div
      className={clsx(
        "flex items-center",
        classNames?.container ?? (size === "lg" ? "gap-2" : "gap-1 md:gap-2")
      )}
    >
      <TimeBox
        value={hours}
        label="HRS"
        size={size}
        isOvertime={isOvertime}
        classNames={classNames}
      />
      <TimeSeparator className={classNames?.separator} />
      <TimeBox
        value={minutes}
        label="MIN"
        size={size}
        isOvertime={isOvertime}
        classNames={classNames}
      />
      <TimeSeparator className={classNames?.separator} />
      <TimeBox
        value={seconds}
        label="SEC"
        size={size}
        isOvertime={isOvertime}
        classNames={classNames}
      />
    </div>
  );
}

const TimeBox = ({
  value,
  label,
  size,
  isOvertime,
  classNames,
}: {
  value: string;
  label: string;
  size: TimerSize;
  isOvertime: boolean;
  classNames?: TimerClassNames;
}) => (
  <div
    className={clsx(
      "flex flex-col items-center rounded-lg",
      isOvertime ? "bg-red-100/80" : "bg-gray-100",
      classNames?.box ??
        (size === "5xl"
          ? "px-14 py-9 min-w-[230px]"
          : size === "4xl"
          ? "px-12 py-8 min-w-[200px]"
          : size === "3xl"
          ? "px-10 py-7 min-w-[170px]"
          : size === "2xl"
          ? "px-9 py-6 min-w-[150px]"
          : size === "xl"
          ? "px-8 py-6 min-w-[140px]"
          : size === "lg"
          ? "px-4 py-4 min-w-[110px]"
          : "px-2 md:px-3 py-2 min-w-[56px]")
    )}
  >
    <span
      className={clsx(
        "font-bold leading-none",
        isOvertime ? "text-red-700" : "text-slate-900",
        classNames?.value ??
          (size === "5xl"
            ? "text-7xl md:text-8xl"
            : size === "4xl"
            ? "text-6xl md:text-7xl"
            : size === "3xl"
            ? "text-5xl md:text-6xl"
            : size === "2xl"
            ? "text-4xl md:text-5xl"
            : size === "xl"
            ? "text-4xl md:text-5xl"
            : size === "lg"
            ? "text-3xl md:text-4xl"
            : "text-base md:text-lg")
      )}
    >
      {value}
    </span>
    <span
      className={clsx(
        isOvertime ? "text-red-600" : "text-gray-500",
        classNames?.label ??
          (size === "5xl"
            ? "text-2xl md:text-3xl"
            : size === "4xl"
            ? "text-xl md:text-2xl"
            : size === "3xl"
            ? "text-lg md:text-xl"
            : size === "2xl"
            ? "text-lg md:text-xl"
            : size === "xl"
            ? "text-base md:text-lg"
            : size === "lg"
            ? "text-sm md:text-base"
            : "text-xs")
      )}
    >
      {label}
    </span>
  </div>
);

const TimeSeparator = ({ className }: { className?: string }) => (
  <span
    className={clsx("text-base md:text-lg font-bold text-gray-500", className)}
  >
    :
  </span>
);
