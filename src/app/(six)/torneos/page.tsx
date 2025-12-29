import { getPublicTournaments } from "@/actions";
import { PublicTournamentCard } from "@/components/eventos/event-grid/PublicTournamentCard";
import { titleFont } from "@/config/fonts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Torneos de Souls In Xtinction TCG | Compite y Demuestra tu Habilidad",
  description:
    "Participa en los torneos oficiales de Souls In Xtinction TCG y enfrentate a los mejores jugadores. Consulta fechas, inscripciones, reglas y premios.",
  openGraph: {
    title:
      "Torneos de Souls In Xtinction TCG | Compite y Demuestra tu Habilidad",
    description:
      "Participa en los torneos oficiales de Souls In Xtinction TCG y enfrentate a los mejores jugadores. Consulta fechas, inscripciones, reglas y premios.",
    url: "https://soulsinxtinction.com/tiendas",
    siteName: "Torneos Souls In Xtinction TCG",
    images: [
      {
        url: "https://soulsinxtinction.com/souls-in-xtinction.webp",
        width: 800,
        height: 600,
        alt: "Souls In Xtinction TCG",
      },
    ],
    locale: "en_ES",
    type: "website",
  },
};

export default async function EventosPage() {
  const { tournaments } = await getPublicTournaments();
  const inProgressCount = tournaments.filter(
    (tournament) => tournament.status === "in_progress"
  ).length;
  const pendingCount = tournaments.filter(
    (tournament) => tournament.status === "pending"
  ).length;

  return (
    <div className="relative min-h-screen bg-[url(/national/bg-national.png)] bg-cover bg-fixed bg-center">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_55%)]" />

      <div className="relative">
        <section className="mx-auto max-w-6xl px-4 pt-10">
          <div className="rounded-3xl border border-white/15 bg-slate-950/70 p-6 text-white shadow-[0_30px_60px_rgba(15,23,42,0.4)] backdrop-blur">
            <p className="text-xs tracking-[0.3em] text-slate-300">
              Circuito nacional
            </p>
            <h1
              className={`${titleFont.className} mt-3 text-4xl font-bold text-white md:text-5xl lg:text-6xl`}
            >
              Torneos TCG
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-200">
              Compite en eventos oficiales y encuentra el siguiente torneo
              disponible en tu ciudad.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-200">
                En progreso: {inProgressCount}
              </span>
              <span className="rounded-full bg-amber-500/20 px-3 py-1 font-semibold text-amber-200">
                Programados: {pendingCount}
              </span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 pb-12 pt-6">
          <div className="space-y-6">
            {tournaments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/30 bg-white/90 p-6 text-center text-sm text-slate-600">
                No hay torneos disponibles por ahora.
              </div>
            ) : (
              tournaments.map((tournament) => (
                <PublicTournamentCard
                  key={tournament.id}
                  tournament={tournament}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
