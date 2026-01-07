export default function Page() {
  return (
    <div className="min-h-screen">
      <div className="flex max-w-3xl flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Administrador
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Panel base para gestionar el sistema. Aquí estarán las secciones
          principales.
        </p>
      </div>
    </div>
  );
}
