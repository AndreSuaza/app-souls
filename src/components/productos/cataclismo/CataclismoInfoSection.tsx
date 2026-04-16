import Image from "next/image";
import Link from "next/link";

export function CataclismoInfoSection() {
  return (
    <section className="w-full bg-[#1f0a12]/70 text-white backdrop-blur-sm">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:px-10 lg:py-24">
        <div className="space-y-6 text-center lg:text-left">
          <h2 className="text-2xl font-black uppercase tracking-wide sm:text-4xl">
           Desata el Cataclismo
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Es momento de evolucionar tu estrategia y dominar el nuevo orden. Consigue Cataclismos y sé parte del siguiente nivel de Souls In Xtinction. Nuevas criaturas, nuevas mecánicas y un poder que cambiará tu forma de jugar.
          </p>
          <Link
            href="https://wa.me/573180726340?text=Hola%2C+me+gustar%C3%ADa+conocer+m%C3%A1s+de+sus+productos+de+la+colecci%C3%B3n+Cataclismo."
            target="_blank"
            rel="noreferrer"
            title="Contactar por WhatsApp"
            className="inline-flex items-center justify-center rounded-lg border border-rose-500 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-rose-200 transition hover:bg-rose-500 hover:text-white"
          >
            Pidelo ya
          </Link>
        </div>

        <div className="flex justify-center lg:justify-center">
          <Image
            src="/products/cataclismo/caja.png"
            alt="Caja Cataclismo"
            title="Caja Cataclismo"
            width={360}
            height={300}
            className="h-auto w-full max-w-[320px] lg:max-w-[500px] object-contain cursor-crosshair"
          />
        </div>
      </div>
    </section>
  );
}
