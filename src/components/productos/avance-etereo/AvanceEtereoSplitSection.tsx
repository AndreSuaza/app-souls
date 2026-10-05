import { AvanceEtereoAscendidaStack } from "@/components/productos/avance-etereo/AvanceEtereoAscendidaStack";

export function AvanceEtereoSplitSection() {
  return (
    <section className="w-full bg-[#081018] py-16 md:py-20">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 text-center lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:text-left">
        <AvanceEtereoAscendidaStack />

        <div className="space-y-4">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#7BE7DE]">
            Rareza Ascendida
          </p>
          <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
            Skjold Antimagia
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Llega <b>Skjold Antimagia</b> en su <b>rareza Ascendida</b>: una
            defensa capaz de aparecer en el instante más crítico y convertir una
            derrota segura en una nueva oportunidad para vencer.
          </p>
        </div>
      </div>
    </section>
  );
}
