"use client";

import Image from "next/image";
import Link from "next/link";

export function PikingosInfoSection() {
  return (
    <>
      {/* Referencia modo light: bg-white text-slate-900, texto text-slate-700 y boton text-purple-600 */}
      <section className="w-full bg-tournament-dark-surface text-white">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:px-10 lg:py-20">
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-2xl font-black uppercase tracking-wide sm:text-4xl">
              ¿Por qué jugar Pikingos?
            </h2>
            <p className="text-sm leading-relaxed text-slate-200 sm:text-base">
              Este mazo estructurado está diseñado para jugadores que disfrutan
              un estilo agresivo y táctico, combinando unidades resistentes con
              efectos que castigan el campo rival. Los Pikingos destacan por su
              capacidad de demoler estructuras, generar ventaja a través del
              desgaste y mantener la agresividad turno tras turno.
            </p>
            <Link
              href="https://wa.me/573180726340?text=Hola%2C+me+gustar%C3%ADa+conocer+m%C3%A1s+de+sus+productos+de+la+colecci%C3%B3n+Pikingos."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-purple-500 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-purple-300 transition hover:bg-purple-500 hover:text-white"
            >
              Pídelo ya
            </Link>
          </div>

          <div className="flex justify-center lg:justify-center lg:-ml-4">
            <Image
              src="/products/pikingos/Mokut-cajas-Pikingos.webp"
              alt="Cajas Pikingos"
              width={340}
              height={285}
              className="h-auto w-full max-w-[300px] object-contain cursor-crosshair"
            />
          </div>
        </div>
      </section>
    </>
  );
}
