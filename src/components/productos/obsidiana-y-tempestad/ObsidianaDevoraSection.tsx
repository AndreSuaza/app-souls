import { ObsidianaDevoraStack } from "@/components/productos/obsidiana-y-tempestad/ObsidianaDevoraStack";

export function ObsidianaDevoraSection() {
  return (
    <section className="w-full bg-[#063a3a]/60 py-16 md:py-20">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 text-center lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:text-left">
        <ObsidianaDevoraStack />

        <div className="space-y-4">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#65eadc]">
            Aliados del pasado
          </p>
          <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
            Devora Cobardes
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Aliados del pasado resurgen para acompañarte en nuevas batallas.
          </p>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            <b>Devora Cobardes</b> asciende en una nueva versión con acabados
            increíbles, relieve y brillo que resaltan cada detalle de la carta.
          </p>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Una pieza imponente en batalla y perfecta para cualquier
            coleccionista.
          </p>
        </div>
      </div>
    </section>
  );
}
