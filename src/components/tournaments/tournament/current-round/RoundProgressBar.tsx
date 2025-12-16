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
    <div className="flex items-center gap-2">
      <div className="w-1/4 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="text-sm text-gray-600">
        {completedMatches}/{totalMatches} Partidas completadas
      </span>
    </div>
  );
};
