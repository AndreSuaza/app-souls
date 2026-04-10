import Image from "next/image";

export function CataclismoHeroSection() {
  return (
    <section className="relative h-auto w-full overflow-hidden bg-gradient-to-br from-[#2a0b10] via-[#3b0f15] to-[#1a070a] lg:min-h-screen">
      <div className="relative flex w-full flex-col lg:block lg:h-screen">
        <div className="order-2 relative z-10 -mt-16 flex w-full lg:order-none lg:mt-0 lg:h-full lg:w-1/2">
          <div className="pikingos-hero-cut flex w-full flex-col justify-start gap-6 bg-[#2a0b10] px-6 py-10 pr-10 text-center text-slate-100 shadow-2xl lg:h-full lg:px-12 lg:py-16 lg:pr-28 lg:pt-14">
            <div className="space-y-4">
              <div className="mx-auto w-full max-w-[135px] sm:max-w-[220px] lg:max-w-[300px]">
                <Image
                  src="/products/cataclismo/logo_cataclismo.png"
                  alt="Logo Cataclismo"
                  title="Logo Cataclismo"
                  width={350}
                  height={150}
                  className="h-auto w-full object-contain"
                />
              </div>
              <div className="-mt-4 space-y-3 sm:-mt-6">
                <p className="text-base font-semibold uppercase tracking-widest text-slate-200 sm:text-lg">
                  No luchan por recursos. Luchan por dominio, por respeto... por
                  imponer su ley.
                </p>
                <p className="mx-auto max-w-xl text-sm text-slate-300 sm:text-base">
                  Un mazo agresivo, directo, donde cada ataque es un juramento
                  que no se rompe.
                </p>
                <p className="text-xl font-black uppercase text-white sm:text-3xl">
                  Ya disponible
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 relative z-0 h-[360px] w-full sm:h-[440px] lg:absolute lg:inset-y-0 lg:-right-16 lg:h-full lg:w-[65%]">
          <Image
            src="/products/cataclismo/Catakairon.jpg.jpeg"
            alt="Mazo Cataclismo"
            title="Mazo Cataclismo"
            fill
            priority
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
