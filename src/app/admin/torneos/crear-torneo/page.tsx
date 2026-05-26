import { CreateTournamentForm } from "@/components/tournaments/crear-torneo/CreateTournamentForm";

export default async function CrearTorneoPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
        Creación del Torneo
      </h1>
      <p className="mb-6 text-slate-500 dark:text-slate-400">
        Ingresa los detalles para configurar tu torneo.
      </p>

      <CreateTournamentForm />
    </div>
  );
}
