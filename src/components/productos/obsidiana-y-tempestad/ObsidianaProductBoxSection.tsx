import Image from "next/image";
import Link from "next/link";

export function ObsidianaProductBoxSection() {
  return (
    <section className="w-full bg-transparent text-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:px-10 lg:py-24">
        <div className="space-y-6 text-center lg:text-left">
          <h2 className="text-2xl font-black uppercase tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-4xl">
            Obsidiana y Tempestad: Enfrentamiento de Dioses
          </h2>
          <p className="text-sm leading-relaxed text-slate-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-base">
            Tezcatlipoca y Quetzalcóatl chocan en una lucha divina por el
            dominio del mundo. Cada uno representa una fuerza distinta, y su
            conflicto da origen a nuevas eras, destrucción, renacimiento y
            poder.
          </p>
          <p className="text-sm leading-relaxed text-slate-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-base">
            Esta expansión lleva ese choque al campo de batalla con nuevas
            mecánicas, estrategias, cartas para coleccionar y muchas formas de
            jugar y divertirse.
          </p>
          <p className="text-sm leading-relaxed text-slate-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-base">
            <b>
              Elige tu fuerza, descubre sus secretos y vive el inicio de una
              guerra entre dioses.
            </b>
          </p>
          <Link
            href="https://wa.me/573180726340?text=Hola%2C+me+gustar%C3%ADa+conocer+m%C3%A1s+de+Obsidiana+y+Tempestad."
            target="_blank"
            rel="noreferrer"
            title="Contactar por WhatsApp"
            className="inline-flex items-center justify-center rounded-lg bg-[#65eadc] px-6 py-2 text-sm font-black uppercase tracking-wide text-[#061f2a] shadow-lg shadow-[#65eadc]/25 transition hover:bg-[#2452d7] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#65eadc] focus:ring-offset-2 focus:ring-offset-[#061f2a]"
          >
            Pídelo ya
          </Link>
        </div>

        <div className="flex justify-center lg:justify-center">
          <Image
            src="/product-pages/obsidiana-y-tempestad/mockup-caja-oyt.png"
            alt="Caja Obsidiana y Tempestad"
            title="Caja Obsidiana y Tempestad"
            width={1601}
            height={1520}
            sizes="(min-width: 1024px) 500px, 90vw"
            className="h-auto w-full max-w-[340px] object-contain drop-shadow-[0_24px_44px_rgba(0,0,0,0.45)] lg:max-w-[540px]"
          />
        </div>
      </div>
    </section>
  );
}
