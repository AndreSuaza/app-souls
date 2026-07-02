import { AvanceEtereoAscendidaStack } from "@/components/productos/avance-etereo/AvanceEtereoAscendidaStack";

export function AvanceEtereoSplitSection() {
  return (
    <section className="w-full bg-[#081018] py-16 md:py-20">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 text-center lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:text-left">
        <div className="space-y-4">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#7BE7DE]">
            Rareza Ascendida
          </p>
          <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
            Lorem ipsum dolor sit amet
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>

        <AvanceEtereoAscendidaStack />
      </div>
    </section>
  );
}
