import Image from "next/image";

export function PikingosHeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-tournament-dark-bg dark:via-tournament-dark-muted dark:to-tournament-dark-bg">
      <div className="relative h-full w-full">
        <div className="relative z-10 flex h-full w-full lg:w-1/2">
          <div className="polygon-right flex h-full w-full flex-col justify-start gap-6 border border-purple-200/60 bg-white px-6 py-10 pr-10 text-center text-slate-900 shadow-2xl dark:border-purple-500/30 dark:bg-tournament-dark-surface dark:text-slate-100 lg:px-12 lg:py-16 lg:pr-28 lg:pt-28">
            <div className="space-y-4">
              <h1 className="text-4xl font-black uppercase tracking-wide text-purple-700 dark:text-purple-200 sm:text-5xl lg:text-6xl">
                Pikingos
              </h1>
              <p className="text-base font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-200 sm:text-lg">
                Regresa a la tierra de la luz y la sombra
              </p>
              <p className="mx-auto max-w-xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                Atrévete a entrar en el plano en constante cambio de Pikingos y
                descubre tu yo interior.
              </p>
            </div>
            <p className="text-2xl font-black uppercase text-slate-900 dark:text-white sm:text-3xl">
              Ya disponible
            </p>
          </div>
        </div>

        <div className="relative h-[360px] w-full sm:h-[440px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[60%]">
          <Image
            src="/products/pikingos/LokiWeb.webp"
            alt="Mazo Pikingos Loki"
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
