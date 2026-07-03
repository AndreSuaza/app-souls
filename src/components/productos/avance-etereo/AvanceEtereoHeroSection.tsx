import Image from "next/image";

export function AvanceEtereoHeroSection() {
  return (
    <section className="relative h-auto w-full overflow-hidden bg-[#edf8f6] lg:min-h-screen">
      <div className="relative flex w-full flex-col lg:block lg:h-screen">
        <div className="order-2 relative z-10 -mt-16 flex w-full lg:order-none lg:mt-0 lg:h-full lg:w-1/2">
          <div className="pikingos-hero-cut flex w-full flex-col justify-start gap-6 bg-[#edf8f6] px-6 py-10 pr-10 text-center text-[#081018] shadow-2xl lg:h-full lg:px-12 lg:py-16 lg:pr-28 lg:pt-14">
            <div className="space-y-4">
              <div className="mx-auto w-full max-w-[250px] sm:max-w-[320px] lg:max-w-[420px]">
                <Image
                  src="/products/avance-etereo/logo.webp"
                  alt="Logo Avance Etéreo"
                  title="Logo Avance Etéreo"
                  width={430}
                  height={220}
                  className="h-auto w-full object-contain"
                />
              </div>
              <div className="-mt-4 space-y-3 sm:-mt-6">
                <p className="text-base font-semibold uppercase tracking-widest text-[#8b6bb7] sm:text-lg">
                  Lorem ipsum dolor sit amet
                </p>
                <p className="mx-auto max-w-xl text-sm text-slate-700 sm:text-base">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p className="text-xl font-black uppercase text-[#347f7a] sm:text-3xl">
                  Ya disponible
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 relative z-0 h-[360px] w-full sm:h-[440px] lg:absolute lg:inset-y-0 lg:-right-16 lg:h-full lg:w-[65%]">
          <Image
            src="/products/avance-etereo/hero-banner.webp"
            alt="Arte Avance Etéreo"
            title="Arte Avance Etéreo"
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
