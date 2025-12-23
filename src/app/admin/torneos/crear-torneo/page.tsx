import { CreateTournamentForm } from "@/components";

export default function CrearTorneoPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Creación del Torneo</h1>
      <p className="text-gray-600 mb-6">
        Ingresa los detalles para configurar tu torneo.
      </p>

      <CreateTournamentForm />
    </div>
  );
}
