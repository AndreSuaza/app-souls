export default function AdminLoading() {
  return (
    <section className="space-y-6" aria-label="Cargando dashboard administrativo">
      <div className="h-32 animate-pulse rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface" />)}
      </div>
    </section>
  );
}
