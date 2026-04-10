import Image from "next/image";
import { TiltCard } from "@/components/ui/tilt/TiltCard";

export function CataclismoDuoCardsSection() {
  return (
    <section className="w-full bg-[#120816]/85 py-16 md:py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-6 text-center lg:px-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
            Cards forged by the cataclysm
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            vitae consequat sapien. Integer tempus, nunc et feugiat dignissim,
            tellus nisl pretium justo, sed viverra velit nisl a erat.
          </p>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex justify-center">
            <TiltCard className="w-full max-w-[300px]">
              <Image
                src="/cards/CAT-091-4685.webp"
                alt="Carta Cataclismo 091"
                title="Carta Cataclismo 091"
                width={360}
                height={520}
                className="h-auto w-full rounded-2xl object-cover shadow-2xl"
              />
            </TiltCard>
          </div>
          <div className="flex justify-center">
            <TiltCard className="w-full max-w-[300px]">
              <Image
                src="/cards/CAT-092-1158.webp"
                alt="Carta Cataclismo 092"
                title="Carta Cataclismo 092"
                width={360}
                height={520}
                className="h-auto w-full rounded-2xl object-cover shadow-2xl"
              />
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
