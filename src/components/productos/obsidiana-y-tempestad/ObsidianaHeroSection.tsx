import Image from "next/image";

export function ObsidianaHeroSection() {
  return (
    <section className="relative h-auto w-full overflow-hidden bg-[#061f2a] lg:min-h-screen">
      <div className="relative flex w-full flex-col lg:block lg:h-screen">
        <div className="order-2 relative z-10 -mt-16 flex w-full lg:order-none lg:mt-0 lg:h-full lg:w-1/2">
          <div className="pikingos-hero-cut flex w-full flex-col justify-start gap-6 bg-[#061f2a] px-6 py-10 pr-10 text-center text-white shadow-2xl lg:h-full lg:px-12 lg:py-16 lg:pr-28 lg:pt-14">
            <div className="space-y-4">
              <div className="mx-auto w-full max-w-[250px] sm:max-w-[320px] lg:max-w-[420px]">
                <Image
                  src="/product-pages/obsidiana-y-tempestad/logo.webp"
                  alt="Logo Obsidiana y Tempestad"
                  title="Logo Obsidiana y Tempestad"
                  width={430}
                  height={414}
                  priority
                  className="h-auto w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
                />
              </div>
              <div className="-mt-4 space-y-3 sm:-mt-6">
                <p className="text-base font-semibold uppercase tracking-widest text-[#5fe1d4] sm:text-lg">
                  La Guerra que Dio Forma al Mundo
                </p>
                <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-100 sm:text-base">
                  <b>Obsidiana y Tempestad</b> es la nueva expansión de Souls In
                  Xtinction, inspirada en el Mito de los Cinco Soles de la
                  tradición Azteca. Tezcatlipoca y Quetzalcóatl se enfrentan en
                  una lucha por el dominio del mundo, desatando fuerzas capaces
                  de destruir una era y dar origen a la siguiente.
                </p>
                <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
                  Una expansión cargada de mitología, poder y nuevas
                  estrategias que llevan este legendario enfrentamiento al campo
                  de batalla.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 relative z-0 h-[360px] w-full sm:h-[440px] lg:absolute lg:inset-y-0 lg:-right-16 lg:h-full lg:w-[65%]">
          <Image
            src="/product-pages/obsidiana-y-tempestad/hero-banner.webp"
            alt="Arte Obsidiana y Tempestad"
            title="Arte Obsidiana y Tempestad"
            fill
            priority
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-contain object-right-bottom drop-shadow-[0_28px_54px_rgba(0,0,0,0.48)]"
          />
        </div>
      </div>
    </section>
  );
}
