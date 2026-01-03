import { RoundInterface } from "@/interfaces";

export const RoundProgressBar = ({
  round,
}: {
  round: RoundInterface | undefined;
}) => {
  if (!round) {
    return (
      <span className="text-sm text-gray-500">
        Aún no se ha generado la ronda
      </span>
    );
  }

  const totalMatches = round.matches.length;
  const completedMatches = round.matches.filter(
    (m) => m.result !== null
  ).length;

  const percentage =
    totalMatches === 0 ? 0 : (completedMatches / totalMatches) * 100;

  return (
    <div className="flex items-center gap-2 w-full justify-between md:justify-normal">
      <div className="flex-1 min-w-0 md:flex-none md:w-1/3 lg:w-1/4 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="text-sm text-gray-600 text-right md:text-start whitespace-nowrap md:whitespace-normal shrink-0 md:shrink">
        {completedMatches}/{totalMatches}{" "}
        <span className="inline md:hidden">Part. fin.</span>
        <span className="hidden md:inline">Partidas completadas</span>
      </span>
    </div>
  );
};
