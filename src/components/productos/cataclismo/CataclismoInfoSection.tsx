import Image from "next/image";
import Link from "next/link";

export function CataclismoInfoSection() {
  return (
    <section className="w-full bg-[#120816]/85 text-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:px-10 lg:py-36">
        <div className="space-y-6 text-center lg:text-left">
          <h2 className="text-2xl font-black uppercase tracking-wide sm:text-4xl">
            Why face Cataclismo?
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
            pretium, urna in viverra elementum, purus justo egestas mauris, quis
            mattis odio magna non massa.
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

        <div className="flex justify-center lg:justify-center lg:-ml-4">
          <Image
            src="/products/cataclismo/caja.png"
            alt="Caja Cataclismo"
            title="Caja Cataclismo"
            width={360}
            height={300}
            className="h-auto w-full max-w-[320px] object-contain cursor-crosshair"
          />
        </div>
      </div>
    </section>
  );
}
