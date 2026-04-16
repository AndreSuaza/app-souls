import Image from "next/image";
import { TiltCard } from "@/components/ui/tilt/TiltCard";

export function CataclismoSplitSection() {
  return (
    <section className="w-full bg-[#120816] py-16 md:py-20">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 text-center lg:grid-cols-[1fr_2fr] lg:text-left lg:px-10">
        <div className="flex justify-center">
          <TiltCard className="w-full max-w-[260px]">
            <Image
              src="/cards/CAT-069-1567.webp"
              alt="Carta Cataclismo 069"
              title="Carta Cataclismo 069"
              width={360}
              height={520}
              className="h-auto w-full rounded-2xl object-cover shadow-2xl cursor-crosshair"
            />
          </TiltCard>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
            Rareza Ascendida: más allá de lo imaginable
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Descubre la nueva rareza Ascendida, una carta diseñada para destacar en todos los sentidos. Con acabados en alto relieve y un nivel de detalle excepcional, representa la cima del diseño dentro de Cataclismos, fusionando poder, estética y exclusividad.
          </p>
        </div>
      </div>
    </section>
  );
}
