import Image from "next/image";
import Link from "next/link";

export function AvanceEtereoProductBoxSection() {
  return (
    <section className="w-full bg-[#102028]/80 text-white backdrop-blur-sm">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:px-10 lg:py-24">
        <div className="space-y-6 text-center lg:text-left">
          <h2 className="text-2xl font-black uppercase tracking-wide sm:text-4xl">
            Lorem ipsum dolor sit
          </h2>
          <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
            volutpat condimentum velit. Class aptent taciti sociosqu ad litora
            torquent per conubia nostra per inceptos himenaeos.
          </p>
          <Link
            href="https://wa.me/573180726340?text=Hola%2C+me+gustar%C3%ADa+conocer+m%C3%A1s+de+sus+productos+de+la+colecci%C3%B3n+Avance+Et%C3%A9reo."
            target="_blank"
            rel="noreferrer"
            title="Contactar por WhatsApp"
            className="inline-flex items-center justify-center rounded-lg border border-[#7BE7DE] px-6 py-2 text-sm font-semibold uppercase tracking-wide text-[#7BE7DE] transition hover:bg-[#7BE7DE] hover:text-[#081018]"
          >
            Pídelo ya
          </Link>
        </div>

        <div className="flex justify-center lg:justify-center">
          <Image
            src="/products/avance-etereo/product-box.webp"
            alt="Caja Avance Etéreo"
            title="Caja Avance Etéreo"
            width={560}
            height={451}
            sizes="(min-width: 1024px) 500px, 90vw"
            className="h-auto w-full max-w-[340px] object-contain lg:max-w-[540px]"
          />
        </div>
      </div>
    </section>
  );
}
