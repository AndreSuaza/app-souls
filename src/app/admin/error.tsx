"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
      <h1 className="text-lg font-semibold">No se pudo cargar la analítica</h1>
      <p className="mt-2 text-sm text-red-200/80">Revisa la conexión y vuelve a intentarlo. Ningún dato fue modificado.</p>
      <button type="button" onClick={reset} className="mt-4 rounded-lg border border-red-300/40 px-4 py-2 text-sm font-semibold hover:bg-red-500/20">Reintentar</button>
    </section>
  );
}
