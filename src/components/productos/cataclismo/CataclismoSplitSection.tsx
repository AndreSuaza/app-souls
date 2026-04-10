import Image from "next/image";

export function CataclismoSplitSection() {
  return (
    <section className="w-full bg-[#1f0a12]/70 py-16 backdrop-blur-sm md:py-20">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 text-center lg:grid-cols-[1fr_2fr] lg:text-left lg:px-10">
        <div className="flex justify-center">
          <Image
            src="/cards/CAT-069-1567.webp"
            alt="Carta Cataclismo 069"
            title="Carta Cataclismo 069"
            width={360}
            height={520}
            className="h-auto w-full max-w-[260px] rounded-2xl object-cover shadow-2xl cursor-crosshair"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
            A single omen
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tempus
            dolor non lorem congue, a scelerisque neque blandit. Etiam viverra
            efficitur augue, at interdum justo.
          </p>
        </div>
      </div>
    </section>
  );
}
