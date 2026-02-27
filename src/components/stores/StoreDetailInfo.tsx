import {
  IoCallOutline,
  IoLocationOutline,
  IoLogoWhatsapp,
} from "react-icons/io5";
import { StoreDetail, StorePendingTournament } from "@/interfaces";
import { StoreTournamentCard } from "./StoreTournamentCard";

interface Props {
  store: StoreDetail;
  tournaments: StorePendingTournament[];
}

export function StoreDetailInfo({ store, tournaments }: Props) {
  const phoneDigits = store.phone?.replace(/\D/g, "");
  const whatsappUrl = phoneDigits ? `https://wa.me/${phoneDigits}` : null;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="rounded-lg border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface/90">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          {store.name}
        </h1>

        <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
          <div className="flex items-start gap-2">
            <IoLocationOutline className="mt-0.5 h-4 w-4 text-purple-500" />
            <div className="space-y-1">
              <p>
                {store.city}, {store.country}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-400">
                {store.address}
              </p>
            </div>
          </div>

          {store.phone && (
            <div className="flex items-center gap-2">
              <IoCallOutline className="h-4 w-4 text-purple-500" />
              <span>{store.phone}</span>
            </div>
          )}
        </div>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 dark:hover:bg-tournament-dark-accent"
          >
            <IoLogoWhatsapp className="h-4 w-4 text-emerald-500" />
            WhatsApp
          </a>
        )}
      </div>

      <div className="h-px w-full bg-slate-200 dark:bg-tournament-dark-border" />

      <div className="flex-1 space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Torneos pendientes
        </h2>

        {tournaments.length > 0 ? (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <StoreTournamentCard
                key={tournament.id}
                tournament={tournament}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-300">
            No hay torneos pendientes por ahora.
          </p>
        )}
      </div>
    </div>
  );
}
