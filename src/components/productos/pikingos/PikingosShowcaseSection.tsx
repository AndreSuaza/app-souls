import Image from "next/image";

export function PikingosShowcaseSection() {
  return (
    <section className="w-full bg-white/10 py-16 md:py-20 backdrop-blur-sm dark:bg-purple-950/40">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 lg:gap-0 px-6 lg:grid-cols-[1.1fr_1fr] lg:px-10">
        <div className="order-2 lg:order-none flex justify-center lg:justify-start">
          <div className="relative h-[420px] w-full max-w-[300px] sm:max-w-[360px]">
            <button
              type="button"
              className="absolute left-0 top-0 z-30 w-[72%] transition-transform duration-200 hover:-translate-y-2"
            >
              <Image
                src="/products/pikingos/1Pikingo.webp"
                alt="Carta Pikingos principal"
                width={360}
                height={520}
                className="h-auto w-full rounded-2xl shadow-2xl"
              />
            </button>
            <button
              type="button"
              className="absolute left-10 top-6 z-20 w-[72%] rotate-6 transition-transform duration-200 hover:-translate-y-2"
            >
              <Image
                src="/products/pikingos/2Pikingo.webp"
                alt="Carta Pikingos secundaria"
                width={360}
                height={520}
                className="h-auto w-full rounded-2xl shadow-xl"
              />
            </button>
            <button
              type="button"
              className="absolute left-20 top-12 z-10 w-[72%] rotate-12 transition-transform duration-200 hover:-translate-y-2"
            >
              <Image
                src="/products/pikingos/3Pikingo.webp"
                alt="Carta Pikingos terciaria"
                width={360}
                height={520}
                className="h-auto w-full rounded-2xl shadow-lg"
              />
            </button>
          </div>
        </div>

        <div className="order-1 lg:order-none text-center lg:text-left px-4 sm:px-10 lg:px-0">
          <h2 className="text-2xl font-black uppercase tracking-wide text-slate-900 dark:text-white sm:text-3xl">
            Descubre un portador de floramargas seriado
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200 sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
            pharetra, augue at tincidunt vehicula, enim justo malesuada arcu,
            vitae volutpat eros massa a est. Vivamus elementum varius sem, non
            viverra lacus tristique vel.
          </p>
        </div>
      </div>
    </section>
  );
}
