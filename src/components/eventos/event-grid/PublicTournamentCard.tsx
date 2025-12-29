import clsx from "clsx";
import moment from "moment";
import Link from "next/link";
import { IoLocationOutline, IoTimeOutline } from "react-icons/io5";

type TournamentCard = {
  id: string;
  title: string;
  date: Date;
  status: "pending" | "in_progress";
  store: {
    name: string;
    address: string;
  };
};

interface Props {
  tournament: TournamentCard;
}

export const PublicTournamentCard = ({ tournament }: Props) => {
  const date = moment(tournament.date);
  const dayName = date.format("dddd");
  const monthName = date.format("MMMM");
  const dayNumber = date.format("DD");
  const time = date.format("h:mm a");
  const isInProgress = tournament.status === "in_progress";

  return (
    <article
      className={clsx(
        "relative overflow-hidden rounded-2xl border bg-white/95 p-5 shadow-lg backdrop-blur",
        isInProgress
          ? "border-emerald-200/60 shadow-emerald-500/10"
          : "border-slate-200"
      )}
    >
      <div
        className={clsx(
          "absolute inset-0 opacity-70",
          isInProgress
            ? "bg-gradient-to-r from-emerald-500/10 via-transparent to-indigo-500/10"
            : "bg-gradient-to-r from-indigo-500/10 via-transparent to-amber-500/10"
        )}
      />
      <div
        className={clsx(
          "absolute left-0 top-0 h-full w-1",
          isInProgress
            ? "bg-gradient-to-b from-emerald-400 to-indigo-500"
            : "bg-gradient-to-b from-amber-400 to-orange-500"
        )}
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900">
              {tournament.title}
            </h3>
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                isInProgress
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              )}
            >
              {isInProgress ? "En progreso" : "Programado"}
            </span>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <div className="hidden items-center gap-2 sm:flex">
              <IoLocationOutline className="text-slate-900" />
              <span className="font-semibold text-slate-700">
                {tournament.store.name}
              </span>
            </div>
            <div className="hidden items-center gap-2 pl-6 sm:flex">
              <span>{tournament.store.address}</span>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-start gap-3 sm:hidden">
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <IoTimeOutline className="text-slate-900" />
                <span>{time}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoLocationOutline className="text-slate-900" />
                <span className="font-semibold text-slate-700">
                  {tournament.store.name}
                </span>
              </div>
              <div className="flex items-center gap-2 pl-6">
                <span>{tournament.store.address}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 self-start">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl border-2 border-slate-300" />
                <div className="flex w-24 flex-col items-center overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm">
                  <div className="w-full bg-slate-900 px-2 py-1 text-center text-xs font-semibold uppercase tracking-wide text-white">
                    {dayName}
                  </div>
                  <div className="flex flex-col items-center px-3 py-2">
                    <span className="text-xs uppercase tracking-wide text-slate-500">
                      {monthName}
                    </span>
                    <span className="text-3xl font-bold leading-none">
                      {dayNumber}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm shadow-slate-900/10 sm:inline-flex">
                <IoTimeOutline className="text-slate-900" />
                <span>{time}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/tiendas"
              className="inline-flex items-center justify-center rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900"
            >
              Ir a la tienda
            </Link>

            {isInProgress && (
              <Link
                href={`/torneos/${tournament.id}`}
                aria-disabled
                tabIndex={-1}
                className="inline-flex items-center justify-center rounded-lg border-2 border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm cursor-not-allowed pointer-events-none"
              >
                Ver torneo
              </Link>
            )}
          </div>
        </div>

        <div className="hidden flex-col items-start gap-3 sm:flex sm:items-end">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl border-2 border-slate-300" />
            <div className="flex w-24 flex-col items-center overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm">
              <div className="w-full bg-slate-900 px-2 py-1 text-center text-xs font-semibold uppercase tracking-wide text-white">
                {dayName}
              </div>
              <div className="flex flex-col items-center px-3 py-2">
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  {monthName}
                </span>
                <span className="text-3xl font-bold leading-none">
                  {dayNumber}
                </span>
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm shadow-slate-900/10">
            <IoTimeOutline className="text-slate-900" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
